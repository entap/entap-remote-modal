declare var bootstrap: any

export class RemoteModal {
    protected modal: Element | null
    protected offcanvas: Element | null

    public constructor(url: string) {
        this.modal = null
        this.offcanvas = null
        this.request(url)
    }

    protected request(url: string, method: string = 'get', formData: FormData | null = null): void {
        fetch(url, {method, body: formData, headers: {'X-Referer': location.href}})
            .then((response: Response) => response.text().then((text: string) => this.render(text, response)))
    }

    protected render(text: string, response: Response) {
        const contentType = response.headers.get('Content-Type')
        if (contentType.indexOf('text/html;') == 0) {
            let parser = new DOMParser()
            let doc = parser.parseFromString(text, 'text/html')
            this.showModal(doc) || this.showOffcanvas(doc) || this.replacePage(doc) || alert(response.statusText)
        } else {
            alert(response.statusText)
        }
    }

    protected showModal(doc: Document) {
        const content = this.getModalContent(doc)
        if (content) {
            if (this.modal) {
                this.modal.innerHTML = content.innerHTML
            } else {
                this.modal = document.body.appendChild(content)
                this.prepareEventListener(this.modal, 'modal', () => this.modal = null)
            }
            bootstrap.Modal.getOrCreateInstance(this.modal)?.show()
            this.prepareContent(this.modal)
            this.modal.dispatchEvent(new CustomEvent('loaded.bs.modal', {bubbles: true}))
            return true
        }
    }

    protected getModalContent(doc: Document) {
        const modal = doc.getElementsByClassName('modal').item(0)
        if (modal) {
            return modal
        }
        const dialog = doc.getElementsByClassName('modal-dialog').item(0)
        if (dialog) {
            const modal = doc.createElement('div')
            modal.classList.add('modal', 'fade')
            modal.appendChild(dialog)
            return modal
        }
    }

    protected showOffcanvas(doc: Document) {
        const content = doc.getElementsByClassName('offcanvas').item(0)
        if (content) {
            if (this.offcanvas) {
                this.offcanvas.innerHTML = content.innerHTML
            } else {
                content.classList.remove('show')
                this.offcanvas = document.body.appendChild(content)
                this.prepareEventListener(this.offcanvas, 'offcanvas', () => this.offcanvas = null)
            }
            bootstrap.Offcanvas.getOrCreateInstance(this.offcanvas)?.show()
            this.prepareContent(this.offcanvas)
            this.offcanvas.dispatchEvent(new CustomEvent('loaded.bs.offcanvas', {bubbles: true}))
            return true
        }
    }

    protected replacePage(doc: Document) {
        if (this.replaceBody(doc)) {
            this.hideModalAndOffcanvas()
            this.updateHead(doc)
            this.rerunScript()
            document.dispatchEvent(new Event("DOMContentLoaded"))
            return true
        }
    }

    protected hideModalAndOffcanvas() {
        if (this.modal) {
            bootstrap.Modal.getInstance(this.modal)?.hide()
        }
        if (this.offcanvas) {
            bootstrap.Offcanvas.getInstance(this.offcanvas)?.hide()
        }
    }

    protected replaceBody(doc: Document) {
        const body = doc.documentElement.getElementsByTagName('body').item(0)
        if (body) {
            let i = 0
            while (document.body.children.length > i) {
                const elem = document.body.children[i]
                if (elem == this.modal || elem == this.offcanvas) {
                    i++
                } else {
                    elem.remove()
                }
            }
            const fragment = document.createDocumentFragment()
            while (body.children.length > 0) {
                fragment.appendChild(body.children[0])
            }
            document.body.appendChild(fragment)
            return true
        }
    }

    protected updateHead(doc: Document) {
        const head = doc.documentElement.getElementsByTagName('head').item(0)
        if (head) {
            if (document.head.title != head.title) {
                document.head.title = head.title
            }
            if (document.head.innerHTML != head.innerHTML) {
                document.head.innerHTML = head.innerHTML
            }
            return true
        }
    }

    protected rerunScript() {
        for (const elem of document.querySelectorAll('script')) {
            const script = document.createElement('script')
            for (const attributeName of elem.getAttributeNames()) {
                script.setAttribute(attributeName, elem.getAttribute(attributeName))
            }
            script.textContent = elem.textContent
            elem.replaceWith(script)
        }
    }

    protected prepareEventListener(content: Element, type: string, onHidden: Function) {
        content.addEventListener('shown.bs.' + type, () => {
            let input = content.querySelector('input:not([type=hidden]),select,textarea') as HTMLElement
            if (input) {
                input.focus()
            }
        })
        content.addEventListener('hidden.bs.' + type, () => {
            document.body.removeChild(content)
            if (onHidden) {
                onHidden()
            }
        })
    }

    protected prepareContent(content: Element) {
        for (const form of content.getElementsByTagName('form')) {
            form.addEventListener('submit', (event) => {
                this.request(form.action, form.method, new FormData(form))
                event.preventDefault()
            })
        }
        for (const anchor of content.getElementsByTagName('a')) {
            anchor.addEventListener('click', (event) => {
                this.request(anchor.href, 'get', null)
                event.preventDefault()
            })
        }
    }
}

function onClick_openRemoteModal(event: MouseEvent) {
    const target = event.target as HTMLElement
    const url = target.getAttribute('href') ?? target.dataset.href
    if (target.dataset.toggle == 'remote-modal' && url) {
        new RemoteModal(url)
        event.preventDefault()
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.removeEventListener('click', onClick_openRemoteModal)
    document.addEventListener('click', onClick_openRemoteModal)
})