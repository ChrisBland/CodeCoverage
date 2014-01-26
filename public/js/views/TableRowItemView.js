var ApexClassRowView = Backbone.Epoxy.View.extend({
  
  el: '<tr><td id="NamespacePrefix"></td><td id="Type"></td><td id="Name"></td><td id="NumLinesCovered"></td><td id="NumLinesUncovered"></td><td id="Total"></td><td id="Coverage"></td><td id="TestClasses"></td><</tr>',
  
  bindings: {
    'td#NamespacePrefix'    : 'text:NamespacePrefix',
    'td#Name'               : 'text:Name, attr:{"data-id":Id}',
    'td#NumLinesCovered'    : 'text:NumLinesCovered',
    'td#NumLinesUncovered'  : 'text:NumLinesUncovered',
    'td#Coverage'           : 'text:Coverage',
    'td#Type'               : 'text:Type',
    'td#TestClasses'        : 'text:TestClasses',
    'td#Total'              : 'text:Total',
    ':el'                   : 'classes:{"warning":CoverageWarning, "danger":CoverageDanger, "success": CoverageSuccess}'
  },
  events: {
    'click td#Name'         : 'open'
  },

  open: function(evt){
    console.log(this);
    console.log(evt);
    console.log('open event');
    var id = $(evt.currentTarget).data("id");
    var item = this.model.collection.get(id);
    App.showApexClass(item);
  }
});