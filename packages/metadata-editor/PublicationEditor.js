import { Component } from 'substance'

class PublicationsEditor extends Component {

  getInitialState() {
    return {
      publications: []
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
      publications: value
    })
    this.context.editorSession.onRender('document', this._onDocumentChange, this)
  }

  render($$) {
    let el = $$('div').addClass('sc-publication-editor').ref('input');

    console.log('publication props', this.props);

    let publications = this.state.publications.map((item, i) => {
      return $$('div').addClass('se-publication-wrapper').addClass('se-publication-item').append(
        $$('div').append((i + 1) + '.'),
        $$('textarea').attr({placeholder: 'Описание' }).addClass('se-publication-item-title').val(item.title).on('change', this._onTitleChange(i)),
        $$('textarea').attr({placeholder: 'Описание (по-английски)' }).addClass('se-publication-item-title').val(item.title_en).on('change', this._onTitleEnChange(i)),
        $$('textarea').attr({placeholder: 'Ссылка' }).addClass('se-publication-item-url').val(item.url).on('change', this._onUrlChange(i)),
        $$('textarea').attr({placeholder: 'Описание ссылки' }).addClass('se-publication-item-url-title').val(item.urlTitle).on('change', this._onUrlTitleChange(i)),
        $$('textarea').attr({placeholder: 'Описание ссылки (по-английски)' }).addClass('se-publication-item-url-title').val(item.urlTitle_en).on('change', this._onUrlTitleEnChange(i))
      )
    })

    el.append(publications)

    el.append(
      $$('div').addClass('se-publication-wrapper').addClass('se-publication-add').append(
        $$('button').addClass('se-publication-add').append('Добавить').on('click', this._addItem)
      )
    )

    return el;
  }

  getPath() {
    return this.props.path
  }

  _addItem() {
    console.log('onAddEvent', event);

    let publications = this.state.publications.slice();
    
    console.log('onTitleChange', publications);

    publications.push({
      title: '',
      url: '',
      urlTitle: ''
    });

    this._modifyDocument(publications); 
  }

  _onTitleChange(index) {
    return (event) => {
      const value = event.target.value;

      let publications = this.state.publications.slice();

      publications[index].title = value;

      this._modifyDocument(publications);
    };
  }

  _onTitleEnChange(index) {
    return (event) => {
      const value = event.target.value;

      let publications = this.state.publications.slice();

      publications[index].title_en = value;

      this._modifyDocument(publications);
    };
  }
  
  _onUrlChange(index) {
    return (event) => {
      const value = event.target.value;

      let publications = this.state.publications.slice();

      publications[index].url = value;

      this._modifyDocument(publications);
    };
  }
  
  _onUrlTitleChange(index) {
    return (event) => {
      const value = event.target.value;

      let publications = this.state.publications.slice();

      publications[index].urlTitle = value;

      this._modifyDocument(publications);
    };
  }
  
  _onUrlTitleEnChange(index) {
    return (event) => {
      const value = event.target.value;

      let publications = this.state.publications.slice();

      publications[index].urlTitle_en = value;

      this._modifyDocument(publications);
    };
  }

  _modifyDocument(publications) {
    let path = this.getPath()
    let editorSession = this.context.editorSession
    this.extendState({
      publications: publications
    })
    editorSession.transaction(tx => {
      tx.set(path, publications)
    }) 
  }

  _onDocumentChange(update) {
    let path = this.getPath()

    if (update.updated[path]) {
      let doc = this.context.doc
      let value = doc.get(path)
      this.setValue(value)
    }
  }

}

export default PublicationsEditor