var _  = require("lodash"),
   htmlToText = require('html-to-text');

function extendListener( root, nodeName ){
  root.listen = root.listen || {}
  root.listen[nodeName+'.create.before'] = function generateBriefAndLogUser(val){
    var root = this
    //1. TODO 摘要规则进一步优化
    ZERO.mlog("node","begin to briefing for", nodeName)
    if( val[root.config.field].length > root.config.limit + root.config.overflow ){

      val[root.config.toField] =
        htmlToText.fromString(val[root.config.field]).slice(0,root.config.limit).replace(/[,.\uff0c\u3002_-]+$/g,"") + '...'

    }else{
      ZERO.mlog("node", "too short, no need to brief", val[root.config.field].length)
    }

    //2. 记录user
    if( root.session('user') ){
      val.user = _.pick(root.session('user'),['id'])
      //TODO expose uid to node for searching
      val.uid = val.user?user.id:0
    }
    return val
  }
}

var nodeModule = {
  deps : ['bus','config','request','model'],
  nodes : {},
  config : {
    auto : true,
    field : 'content',
    toField : 'brief',
    limit : 300,
    overflow : 100,
    exclude : []
  },
  route : {},
  expand : function( module ){
    var root = this
    if( module.models ){
      module.models.forEach(  function( model){
        if( model.isNode ){
          root.nodes[model.identity] = model
          root.addRoute( root.route, model.identity)
        }
      })
    }
  },
  addRoute : function( route, modelName ){
    var root = this
    route['GET /'+modelName+"/count"] = {
      "function": function (req, res, next) {
        console.log( req.params)
        var params = _.merge(req.params, req.query,req.body)
        if( Object.keys(params).length ) {
          //TODO not support advance count
          console.log("=================go to next")
          return next()
        }

        root.dep.model.models[modelName].count().then(function (total) {
          console.log("total",total)
          res.status(200).json({count:total})
        })
      },
      "order": {before: "rest.crud"}
    }
  },
  bootstrap : {
    "function": function() {
      var root = nodeModule
      _.forEach(root.nodes, function (node, nodeName) {
        if (root.config.auto === true && node.brief !== false) {
          extendListener(root, nodeName)
        } else if (root.config.auto === false && node.brief === true) {
          extendListener(root, nodeName)
        }
      })
      root.dep.bus.expand(root)
      root.dep.request.expand(root)
      ZERO.mlog("NODE", "after extend listener", root.listen)
      ZERO.mlog("NODE", "after extend listener", root.route)

    },
    "order": {before: "request.bootstrap"}
  }
}

module.exports = nodeModule