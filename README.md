# zero-node #

This module helps you deal with models used in blog or other CMS easily.

## Usage ##

1. Add dependency to your module package.json file like:

```
{
	"name" : "YOUR_MODULE_NAME",
	"zero" : {
		"dependencies" : {
			"node" : "^0.0.1"
		}
	}
}
```

2. Declare `isNode` in module.exports like:

```
module.exports = {
	models : [{
       identity : "post",
       isNode : true
    }]
}
```

3. Node module will generate brief for node content, you can specify its behavior through global configs:

```
{
	"node" : {
		auto : true,  //auto generate brief for node model
		field : 'content', //the key of node content to brief
		toField : 'brief', //which field to save brief
		limit : 300, //brief length
		exclude : [], //model in this array do not need briefing
	}
}
```

4. Node will add an extra `count` route for every node model. For example you declared a `post` node. So there will be a route as `http://localhost/post/count` will returns the amount of post.

