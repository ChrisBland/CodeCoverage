var ApexTableView = Backbone.Epoxy.View.extend({

  el: '#coverage',

  initialize: function(opts){
    this.collection = opts.collection;
    App.socket.emit('ApexClasses');
    App.socket.emit('ApexTriggers');
  },

  sortView: function(prop){
    this.collection.sortApex(prop);
  },

  bindings: "data-bind",

  events: {
    'click th' : 'sortTable'
  },

  close: function(){
    this.remove();
    this.unbind();
  },

  sortTable: function(evt){
    var self = this;
    var $target = $(evt.target);
    var sortField = $target.data('field');
    if(sortField) self.sortView(sortField);
  }

});
