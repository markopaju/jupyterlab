// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  PathExt
} from '@jupyterlab/coreutils';

import {
  ABCWidgetFactory, DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  PromiseDelegate
} from '@phosphor/coreutils';

import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';


/**
 * The class name added to a imageviewer.
 */
const IMAGE_CLASS = 'jp-ImageViewer';


/**
 * A widget for images.
 */
export
class ImageViewer extends Widget implements DocumentRegistry.IReadyWidget {
  /**
   * Construct a new image widget.
   */
  constructor(context: DocumentRegistry.Context) {
    super({ node: Private.createNode() });
    this.context = context;
    this.node.tabIndex = -1;
    this.addClass(IMAGE_CLASS);

    this._onTitleChanged();
    context.pathChanged.connect(this._onTitleChanged, this);

    context.ready.then(() => {
      if (this.isDisposed) {
        return;
      }
      this._render();
      context.model.contentChanged.connect(this.update, this);
      context.fileChanged.connect(this.update, this);
      this._ready.resolve(void 0);
    });
  }

  /**
   * The image widget's context.
   */
  readonly context: DocumentRegistry.Context;

  /**
   * A promise that resolves when the image viewer is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * The scale factor for the image.
   */
  get scale(): number {
    return this._scale;
  }
  set scale(value: number) {
    if (value === this._scale) {
      return;
    }
    this._scale = value;
    this.updateStyle();
  }

  /**
   * The rotation of the image.
   */
  get rotation(): number {
    return this._rotation;
  }
  set rotation(value: number) {
    if (value === this._rotation) {
        return;
    }
    this._rotation = value % 360;
    this.updateStyle();
  }

  /**
   * The horizontal flip of the image.
   */
  get horizontalflip(): number {
    return this._horizontalflip;
  }
  set horizontalflip(value: number) {
    if (value === this._horizontalflip) {
        return;
    }
    this._horizontalflip = value;
    this.updateStyle();
  }

  /**
   * The vertical flip of the image.
   */
  get verticalflip(): number {
    return this._verticalflip;
  }
  set verticalflip(value: number) {
    if (value === this._verticalflip) {
        return;
    }
    this._verticalflip = value;
    this.updateStyle();
  }

  /**
   * The color inversion of the image.
   */
  get colorinversion(): number {
    return this._colorinversion;
  }
  set colorinversion(value: number) {
    if (value === this._colorinversion) {
        return;
    }
    this._colorinversion = value;
    this.updateStyle();
  }

  /**
   * Handle `update-request` messages for the widget.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.isDisposed || !this.context.isReady) {
      return;
    }
    this._render();
  }

  /**
   * Handle `'activate-request'` messages.
   */
  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }

  /**
   * Handle a change to the title.
   */
  private _onTitleChanged(): void {
    this.title.label = PathExt.basename(this.context.localPath);
  }

  /**
   * Render the widget content.
   */
  private _render(): void {
    let context = this.context;
    let cm = context.contentsModel;
    if (!cm) {
      return;
    }
    let content = context.model.toString();
    let src = `data:${cm.mimetype};${cm.format},${content}`;
    let node = this.node.querySelector('img') as HTMLImageElement;
    node.setAttribute('src', src);
  }

  private updateStyle(): void {
      let transformString: string;
      let filterString: string;

      transformString = `translate(-50%,-50%) `;
      transformString += `scale(${this._scale * this._horizontalflip},${this._scale * this._verticalflip}) `;
      transformString += `rotate(${this._rotation}deg)`;
      filterString = `invert(${this._colorinversion})`;

      let rotNode = this.node.querySelector('div') as HTMLElement;
      rotNode.style.transform = transformString;
      rotNode.style.filter = filterString;
  }

  private _scale = 1;
  private _rotation = 0;
  private _horizontalflip = 1;
  private _verticalflip = 1;
  private _colorinversion = 0;
  private _ready = new PromiseDelegate<void>();
}


/**
 * A widget factory for images.
 */
export
class ImageViewerFactory extends ABCWidgetFactory<ImageViewer, DocumentRegistry.IModel> {
  /**
   * Create a new widget given a context.
   */
  protected createNewWidget(context: DocumentRegistry.IContext<DocumentRegistry.IModel>): ImageViewer {
    return new ImageViewer(context);
  }
}

/**
 * A namespace for image widget private data.
 */
namespace Private {
  /**
   * Create the node for the image widget.
   */
  export
  function createNode(): HTMLElement {
    let node = document.createElement('div');
    let innerNode = document.createElement('div');
    let image = document.createElement('img');
    node.appendChild(innerNode);
    innerNode.appendChild(image);
    return node;
  }
}
