declare var bootstrap: any

/**
 * Bootstrap5のModalやOffcanvasとして、別ページのコンテンツを埋め込み表示する
 */
export class RemoteModal {
    protected modal: Element | null
    protected offcanvas: Element | null

    /**
     * RemoteModalのインスタンスを作成する
     * @param url {string} 表示するURL
     */
    public constructor(url: string) {
        this.modal = null
        this.offcanvas = null
        this.request(url)
    }

    /**
     * HTTPリクエストを送信し、レスポンスの内容を元に表示する
     *
     * @param url {string} URL
     * @param method {string} リクエストメソッド
     * @param formData {FormData} フォームデータ
     * @protected
     */
    protected request(url: string, method: string = 'get', formData: FormData | null = null): void {
        fetch(url, {method, body: formData, headers: {'X-Referer': location.href}})
            .then((response: Response) => response.text().then((text: string) => this.render(text, response)))
    }

    /**
     * レスポンスの内容を元に表示する
     *
     * @param text {string} レスポンスの内容
     * @param response {Response} レスポンス情報
     * @protected
     */
    protected render(text: string, response: Response): void {
        const contentType = response.headers.get('Content-Type')
        if (contentType.indexOf('text/html;') == 0) {
            let parser = new DOMParser()
            let doc = parser.parseFromString(text, 'text/html')
            this.showModal(doc) || this.showOffcanvas(doc) || this.replacePage(doc) || alert(response.statusText)
        } else {
            alert(response.statusText)
        }
    }

    /**
     * レスポンスのDOMオブジェクトを指定し、モーダルダイアログを表示する
     *
     * @param doc {Document} レスポンスのDOMオブジェクト
     * @return {boolean} モーダルダイアログを表示したか？
     * @protected
     */
    protected showModal(doc: Document): boolean {
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

    /**
     * レスポンスのDOMオブジェクトから、モーダルダイアログのコンテンツを取得する
     *
     * @param doc {Document} レスポンスのDOMオブジェクト
     * @return {Element} 取得したモーダルダイアログのコンテンツ
     * @protected
     */
    protected getModalContent(doc: Document): Element {
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

    /**
     * レスポンスのDOMオブジェクトから、オフキャンバスを表示する
     *
     * @param doc {Document} レスポンスのDOMオブジェクト
     * @return {boolean} オフキャンバスを表示したか？
     * @protected
     */
    protected showOffcanvas(doc: Document): boolean {
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

    /**
     * レスポンスのDOMオブジェクトで、ページ全体を置き換えて表示する
     *
     * @param doc {Document} レスポンスのDOMオブジェクト
     * @return {boolean} 表示に成功したか？
     * @protected
     */
    protected replacePage(doc: Document): boolean {
        if (this.replaceBody(doc)) {
            this.hideModalAndOffcanvas()
            this.updateHead(doc)
            this.rerunScript()
            document.dispatchEvent(new Event("DOMContentLoaded"))
            return true
        }
    }

    /**
     * モーダルダイアログとオフキャンバスを非表示にする
     *
     * @protected
     */
    protected hideModalAndOffcanvas(): void {
        if (this.modal) {
            bootstrap.Modal.getInstance(this.modal)?.hide()
        }
        if (this.offcanvas) {
            bootstrap.Offcanvas.getInstance(this.offcanvas)?.hide()
        }
    }

    /**
     * bodyタグの中身を置き換える
     *
     * @param doc {Document} レスポンスのDOMオブジェクト
     * @return {boolean} 表示に成功したか？
     * @protected
     */
    protected replaceBody(doc: Document): boolean {
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

    /**
     * headタグの中身を置き換える
     *
     * @param doc {Document} レスポンスのDOMオブジェクト
     * @return {boolean} 表示に成功したか？
     * @protected
     */
    protected updateHead(doc: Document): boolean {
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

    /**
     * スクリプトを再実行する
     *
     * @protected
     */
    protected rerunScript(): void {
        for (const elem of document.querySelectorAll('script')) {
            const script = document.createElement('script')
            for (const attributeName of elem.getAttributeNames()) {
                script.setAttribute(attributeName, elem.getAttribute(attributeName))
            }
            script.textContent = elem.textContent
            elem.replaceWith(script)
        }
    }

    /**
     * モーダルダイアログまたはオフキャンバスの表示時、非表示の処理を準備する
     *
     * @param target {Element} モーダルダイアログまたはオフキャンバスのDOM
     * @param type {string} modalまたはoffcanvasの文字列
     * @param onHidden {Function} 非表示時の処理
     * @protected
     */
    protected prepareEventListener(target: Element, type: string, onHidden: Function): void {
        target.addEventListener('shown.bs.' + type, () => {
            let input = target.querySelector('input:not([type=hidden]),select,textarea') as HTMLElement
            if (input) {
                input.focus()
            }
        })
        target.addEventListener('hidden.bs.' + type, () => {
            document.body.removeChild(target)
            if (onHidden) {
                onHidden()
            }
        })
    }

    /**
     * モーダルダイアログまたはオフキャンバスのformタグとaタグのイベントをフックする
     *
     * @param target {Element} モーダルダイアログまたはオフキャンバスのDOM
     * @protected
     */
    protected prepareContent(target: Element): void {
        for (const form of target.getElementsByTagName('form')) {
            form.addEventListener('submit', (event) => {
                this.request(form.action, form.method, new FormData(form))
                event.preventDefault()
            })
        }
        for (const anchor of target.getElementsByTagName('a')) {
            anchor.addEventListener('click', (event) => {
                this.request(anchor.href, 'get', null)
                event.preventDefault()
            })
        }
    }
}

/**
 * クリック時の処理
 *
 * @param event {MouseEvent} マウスイベント
 */
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