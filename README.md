entap-remote-modal
====

Bootstrap5のModalやOffcanvasとして、別ページのコンテンツを埋め込み表示するライブラリです。

## Requirement

- bootstrap5

## Usage

### RemoteModal.jsの組み込み

es6のモジュールになっているため、import文で読み込んでください。

```javascript
import RemoteModal from "RemoteModal"
```

### 呼び出す側のHTML

data-toggle属性にremote-modal、data-href属性にリモートコンテンツのURLを指定してください。

```html

<button type="button" class="btn"
        data-toggle="remote-modal" data-href="example-modal.html">Open
</button>
<button type="button" class="btn"
        data-toggle="remote-modal" data-href="example-offcanvas.html">Open
</button>
```

### モーダルダイアログを表示するHTML(example-modal.html)

```html

<div class="modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Modal 1</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Modal body text goes here.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Save changes</button>
            </div>
        </div>
    </div>
</div>
```

### オフキャンバスを表示するHTML(example-offcanvas.html)

```html

<div class="offcanvas offcanvas-start">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">Offcanvas 1</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <p>This is Offcanvas</p>
    </div>
</div>
```

### 埋め込みコンテンツの特性

埋め込みコンテンツ内で、フォーム送信またはリンクを張った場合、下記のような振る舞いをします。

- 同種のコンテンツ（例えば、モーダルダイアログからモーダルダイアログ、オフキャンバスからオフキャンバス）を開くと、中のコンテンツを更新します。
- 異種のコンテンツ（例えば、モーダルダイアログからオフキャンバス、オフキャンバスからモーダルダイアログ）を開くと、新しく開いて表示します。
- モーダルダイアログでもオフキャンバスでもない場合、開いているモーダルダイアログ・オフキャンバスを閉じ、ドキュメント全体を置き換えて表示します。

## インストール

```bash
npm install entap-remote-modal
```

## Contribution

## Licence

[MIT](https://github.com/entap/entap-remote-modal/blob/main/LICENSE)

## Author

[entap](https://github.com/entap)
