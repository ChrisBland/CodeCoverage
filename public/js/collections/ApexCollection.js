var Apexs = Backbone.Collection.extend({

  model: Apex,

  view: ApexClassRowView,

  sortAttribute: "NumLinesCovered",
  sortDirection: 1,

  initialize: function () {
  },

  getById: function( id ){
    var itemFound = this.find(function(item){return item.get("Id") === id;});
    return itemFound || null;
  },

  sortApex: function (attr) {
    if(this.sortAttribute == attr){
      this.sortDirection*= -1;
    }
    this.sortAttribute = attr;
    this.sort();
  },

  comparator: function(a, b) {
    var a = a.get(this.sortAttribute),
        b = b.get(this.sortAttribute);

    if (a == b) return 0;

    if (this.sortDirection == 1) {
       return a > b ? 1 : -1;
    } else {
       return a < b ? 1 : -1;
    }
  }

});