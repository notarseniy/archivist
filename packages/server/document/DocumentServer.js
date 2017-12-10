let DocumentServer = require('substance').DocumentServer
let isEmpty = require('lodash/isEmpty')

/*
  DocumentServer module. Can be bound to an express instance
*/
class ArchivistDocumentServer extends DocumentServer {
  constructor(config){
    super(config)
    this.authEngine = config.authEngine
    this.indexer = config.indexer
  }

  bind(app) {
    app.post(this.path, this.authEngine.hasAccess.bind(this.authEngine), this._createDocument.bind(this))
    app.get(this.path + '/search', this._searchDocuments.bind(this))
    app.get(this.path + '/:id', this._getDocument.bind(this))
    app.delete(this.path + '/:id', this.authEngine.hasSuperAccess.bind(this.authEngine), this._deleteDocument.bind(this))

    // search
    app.get(this.path + '/resource/:id', this._listResourceDocuments.bind(this))
    app.get(this.path, this._listDocuments.bind(this))
    app.get(this.path + '/:id/search', this._searchFragments.bind(this))

    // debug
    // app.get(this.path + '/reindex/all', this._reindexDocuments.bind(this))
    // app.get(this.path + '/:id/index', this._indexDocument.bind(this))
  }

  _createDocument(req, res, next) {
    const doc = req.body
    this.engine.createDocument(doc, function(err, version) {
      if (err) return next(err)
      res.json(version)
    })
  }

  /*
    Get a document with given document id
  */
  _getDocument(req, res, next) {
    const getDocument = (documentId) => {
      this.engine.getDocument(documentId, function(err, doc) {
        if (err) return next(err)
        res.json(doc)
      })
    };
    
    // ?slug=true
    /*if (this.query.slug) {
      const query = 'SELECT \
      d."documentId" as id \
      FROM documents d \
      WHERE d."slug" = $1';

      this.db.run(query, [req.params.id], function (err, doc) {
        if (err) {
          return next(new Err('ArchivistDocumentServer.getDocumentError', {
            cause: err
          }));
        }
        
        getDocument(doc.slug);
      });
    } else {*/
      getDocument(req.params.id);
    //}
    
    
  }

  /*
    List available documents
  */
  _listDocuments(req, res, next) {
    let args = req.query
    
    this.engine.listDocuments(args, function(err, docs) {
      if (err) return next(err)
      res.json(docs)
    })
  }

  /*
    List documents with particuar resource reference
  */
  _listResourceDocuments(req, res, next) {
    let resourceId = req.params.id
    let published = req.query.public
    
    this.engine.listResourceDocuments(resourceId, published, function(err, docs) {
      if (err) return next(err)
      res.json(docs)
    })
  }

  /*
    Search documents
  */
  _searchDocuments(req, res, next) {
    let args = req.query

    let search = args.query
    let language = args.language

    let filters = args.filters || {}
    let options = args.options || {}

    if(!isEmpty(filters)) filters = JSON.parse(filters)
    if(!isEmpty(options)) options = JSON.parse(options)

    if(search) filters.query = "'" + search + "'"
    if(language) filters.language = "'" + language + "'"

    this.indexer.searchDocuments(filters, options)
      .then(function(resp) {
        res.json(resp)
      })
      .catch(function(err) {
        next(err)
      })
  }

  /*
    Search document fragments
  */
  _searchFragments(req, res, next) {
    let args = req.query
    let documentId = req.params.id

    let search = args.query
    let language = args.language

    let filters = args.filters || {}
    let options = args.options || {}

    if(!isEmpty(filters)) filters = JSON.parse(filters)
    if(!isEmpty(options)) options = JSON.parse(options)

    filters.documentId = documentId
    if(search) filters.query = "'" + search + "'"
    if(language) filters.language = "'" + language + "'"

    this.indexer.searchFragments(filters, options)
      .then(function(resp) {
        res.json(resp)
      })
      .catch(function(err) {
        next(err)
      })
  }


  /**********
  *   DEBUG
  ***********/

  _reindexDocuments(req, res, next) {
    this.indexer.indexAll()
      .then(function(resp) {
        res.json(resp)
      })
      .catch(function(err) {
        res.json(err)
      })
  }

  _indexDocument(req, res, next) {
    let documentId = req.params.id

    this.indexer.index(documentId)
      .then(function(resp) {
        res.json(resp)
      })
      .catch(function(err) {
        res.json(err)
      })
  }

}

export default ArchivistDocumentServer
