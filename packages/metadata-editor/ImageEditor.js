import { Component } from 'substance'

class ImageEditor extends Component {

  getInitialState() {
    return {
      images: []
    };
  }

  dispose() {
    super.dispose.call(this)
    this.context.editorSession.off(this)
  }

  didMount() {
    console.log('didMount');
    console.log('this', this);
    let doc = this.context.doc
    let path = this.getPath()
    let value = doc.get(path)
    console.log('didMount', doc, this.getPath(), value);

    this.setState({
      images: value
    })
    this.context.editorSession.onRender('document', this._onDocumentChange, this)

    let input = this.refs.input
    let uc = input.find('.se-image-add-uc');
  }

  didUpdate() {
    console.log('didUpdate');
    if (!this.props.multiple && this.state.images.length) {
      this.uploadcare = uploadcare.SingleWidget('.se-image-add-uc');
      
      this.uploadcare.onUploadComplete((upload) => {
        this._onUpload({
          url: upload.cdnUrl,
          title: ''
        });
      });
    }
    if (this.props.multiple) {
      this.uploadcare = uploadcare.MultipleWidget('.se-image-add-uc');
      
      this.uploadcare.onUploadComplete((upload) => {
        console.log('file on upload complete', upload);
        uploadcare.loadFileGroup(upload.uuid)
          .done((fileGroup) => {
            const files = fileGroup.files();

            files.forEach((item) => {
              item.then((file) => {
                this._onUpload({
                  url: file.cdnUrl,
                  title: ''
                });
              })
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }); 
    }
  }

  render($$) {
    let el = $$('div').addClass('sc-image-editor').ref('input');

    console.log('image props', this.props);

    let images = this.state.images.map((item, i) => {
      return $$('div').addClass('se-image-wrapper').addClass('se-image-item').append(
        $$('img').attr({ src: item.url }).addClass('se-image-item-img'),
        (this.props.title) ? $$('textarea').attr({placeholder: 'Подпись' }).addClass('se-image-item-title').val(item.title).on('change', this._onTitleChange(i)) : null,
        $$('div').addClass('se-image-item-settings').append(
          (this.props.multiple) ? $$('button').addClass('se-image-item-settings-move-top').addClass((i === 0) ? 'hidden' : '').on('click', this._onMoveTop(i)).append('↑') : null,
          (this.props.multiple) ? $$('button').addClass('se-image-item-settings-move-down').addClass((i === this.state.images.length - 1) ? 'hidden' : '').on('click', this._onMoveDown(i)).append('↓') : null,
          $$('button').addClass('se-image-item-settings-delete').on('click', this._onDelete(i)).append('Удалить')
        )
      )
    })

    el.append(images)

    if (!(!this.props.multiple && this.state.images.length)) {
      el.append(
        $$('div').addClass('se-image-wrapper').addClass('se-image-add').append(
          $$('input').attr({ type: 'hidden', role: 'uploadcare-uploader', name: 'images', 'data-crop': 'disabled', 'data-images-only': true, 'data-multiple': !!this.props.multiple }).addClass('se-image-add-uc')
        )
      )
    }

    return el;
  }

  getPath() {
    return this.props.path
  } 

  _onUpload(file) {
    const images = this.state.images.concat(file);

    this._modifyDocument(images);
  }

  _onTitleChange(index) {
    return (event) => {
      console.log('onTitleChangeEvent', event);

      const value = event.target.value;

      let images = this.state.images.slice();
      
      console.log('onTitleChange', index, images);

      images[index].title = value;

      this._modifyDocument(images);
    };
  }

  _onMoveTop(index) {
    if (index === 0) return () => {};

    return () => {
      let images = this.state.images.slice();
      let tmp = images[index - 1];
      
      images[index - 1] = images[index];
      images[index] = tmp;

      console.log('onMoveTop', index, images);

      this._modifyDocument(images);
    }
  }
  
  _onMoveDown(index) {
    if (index === this.state.images.length - 1) return () => {};

    return () => {
      let images = this.state.images.slice();
      let tmp = images[index + 1];
      
      images[index + 1] = images[index];
      images[index] = tmp;

      console.log('onMoveDown', index, images);

      this._modifyDocument(images);
    }
  }

  _onDelete(index) {
    return () => {
      const images = this.state.images.filter((item, idx) => {
        return idx != index;
      });

      console.log('onDelete', index, images);

      this._modifyDocument(images);
    }
  }

  _modifyDocument(images) {
    let path = this.getPath()
    let editorSession = this.context.editorSession
    this.extendState({
      images: images
    })
    editorSession.transaction(tx => {
      tx.set(path, images)
    }) 
  }

  _onDocumentChange(update) {
    let path = this.getPath()
    console.log('onDocumentChange', path, update);
    if (update.updated[path]) {
      let doc = this.context.doc
      let value = doc.get(path)
      this.setValue(value)
    }
  }

}

export default ImageEditor