var ApexDetailView = Backbone.Epoxy.View.extend({
  
  el: '#ApexDetailTemplate',
  
  initialize: function(opts){
    console.log(this);
    opts.model.fetchBody();
  },

  bindings: "data-bind"
});