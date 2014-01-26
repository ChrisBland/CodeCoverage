(function(){
  var App = App || {};
  window.App = App || {};
  App.socket = io.connect('http://localhost');
  App.loaded = {
    ApexClass: false,
    ApexTrigger: false,
    isLoaded: function(){
      return (this.ApexClass && this.ApexTrigger);
    },
    setType: function(type){
      if(type == 'ApexClass') this.ApexClass = true;
      if(type == 'ApexTrigger') this.ApexTrigger = true;
    }
  };
  App.getCoverage = function(type){
    App.loaded.setType(type);
    if(App.loaded.isLoaded()){
      App.socket.emit('CoverageAggregate', {});
    }
  }

  App.socket.on('ApexBodyResult', function(data){
    console.log('ApexBodyResult');
    console.log(data);
    toastr.success('Loaded: Apex Body');
    var model = App.collection.getById(data.Id);
    if(model){
      model.set({'Body':data.Body});
    }
  });

  App.socket.on('CoverageAggregateResult', function (resp) {
    if(!resp.error){
      var records = resp.records;
      toastr.success('Loaded: Coverage Aggregate Result');
      console.log(records);
      _.each(records, function(sobj){
        var model = App.collection.getById(sobj.ApexClassOrTriggerId);
        if(model){
          model.set({'NumLinesCovered':sobj.NumLinesCovered});
          model.set({'NumLinesUncovered':sobj.NumLinesUncovered});
        }
      });
    }else{
      toastr.warning(resp.errMsg);
    }
    
  });

  App.socket.on('ApexCodeCoverage', function(data) {
    _.each(data, function(sobj){
      var model = App.collection.getById(sobj.ApexClassOrTriggerId);
      console.log(model);
      if(model){
        var testClass = App.collection.getById(sobj.ApexTestClassId);
        var name = testClass.get('Name');
        console.log(name);
        model.modifyArray("testClasses", "push", name);
      }
    });
  });

  

  App.socket.on('ApexClass', function (resp) {
    if(!resp.error){
      toastr.success('Loaded: Apex Classes');
      var records = resp.records;
      _.each(records, function(sobj){
        sobj.Type = 'Apex Class';
        delete sobj.attributes;
        App.collection.add(new Apex(sobj));
      });
      App.getCoverage('ApexClass');
    }else{
      toastr.warning(resp.errMsg);
    }
    
  });

  App.socket.on('ApexTrigger', function (resp) {
    if(!resp.error){
      toastr.success('Loaded: Apex Triggers');
      var records = resp.records;
      _.each(records, function(sobj){
        sobj.Type = 'Apex Trigger';
        delete sobj.attributes;
        App.collection.add(new Apex(sobj));
      });
      App.getCoverage('ApexTrigger');
    }else{
      toastr.warning(resp.errMsg);
    }
  });

  App.showApexClass = function(model){
    console.log(model);
    App.tableView.close();
    var detailView = new ApexDetailView({model:model});
  }
  
  $(document).ready(function(){
    App.collection = new Apexs();
    var tableView = new ApexTableView({collection: App.collection});
    App.tableView = tableView;
  })

})();;var Apex = Backbone.Epoxy.Model.extend({
  idAttribute : 'Id',

  initialize: function(){
  },

  defaults: {
    NamespacePrefix: '',
    NumLinesCovered: 0,
    NumLinesUncovered: 0,
    testClasses: [],
    Name: '',
    Body: ''
  },

  fetchBody: function(){
    App.socket.emit('ApexBody', {id: this.get('Id'), type: this.get('Type')});
  },

  computeds: {
    Total: {
      deps: ['NumLinesCovered', 'NumLinesUncovered'],
      get: function(NumLinesCovered, NumLinesUncovered){
        return NumLinesCovered + NumLinesUncovered;
      }
    },
    TestClasses: {
      deps: ['testClasses'],
      get: function(testClasses){
        return testClasses.length;
      }
    },
    IsTestClass: {
      deps: ['NumLinesCovered', 'NumLinesUncovered'],
      get: function(NumLinesCovered, NumLinesUncovered){
        var totalLines = NumLinesCovered + NumLinesUncovered;
        if( totalLines === 0){
          return true;
        }else{
          return false;
        }
      }
    },
    Coverage: {
      deps: ['NumLinesCovered', 'NumLinesUncovered'],
      get: function(NumLinesCovered, NumLinesUncovered){
        var totalLines = NumLinesCovered + NumLinesUncovered;
        if( totalLines === 0){
          return '-';
        }else{
          return ((NumLinesCovered/totalLines)*100).toFixed(2)+'%';
        }
      }
    },
    CoverageNumeric: {
      deps: ['NumLinesCovered', 'NumLinesUncovered'],
      get: function(NumLinesCovered, NumLinesUncovered){
        var totalLines = NumLinesCovered + NumLinesUncovered;
        if( totalLines === 0){
          return -1;
        }else{
          return (NumLinesCovered/totalLines);
        }
      }
    },
    CoverageDanger:{
      deps: ['NumLinesCovered', 'NumLinesUncovered'],
      get: function(NumLinesCovered, NumLinesUncovered){
        var totalLines = NumLinesCovered + NumLinesUncovered;
        if( totalLines === 0){
          return false;
        }else{
          var coverage = (NumLinesCovered/totalLines)*100;
          return (coverage >= 0 && coverage <= 50) ? true : false;
        }
      }
    },

    CoverageWarning:{
      deps: ['NumLinesCovered', 'NumLinesUncovered'],
      get: function(NumLinesCovered, NumLinesUncovered){
        var totalLines = NumLinesCovered + NumLinesUncovered;
        if( totalLines === 0){
          return false;
        }else{
          var coverage = (NumLinesCovered/totalLines)*100;
          return (coverage > 50 && coverage < 75) ? true : false;
        }
      }
    },

    CoverageSuccess:{
      deps: ['NumLinesCovered', 'NumLinesUncovered'],
      get: function(NumLinesCovered, NumLinesUncovered){
        var totalLines = NumLinesCovered + NumLinesUncovered;
        if( totalLines === 0){
          return false;
        }else{
          var coverage = (NumLinesCovered/totalLines)*100;
          return (coverage > 90 && coverage <= 100) ? true : false;
        }
      }
    }
  }
});
;var ApexDetailView = Backbone.Epoxy.View.extend({
  
  el: '#ApexDetailTemplate',
  
  initialize: function(opts){
    console.log(this);
    opts.model.fetchBody();
  },

  bindings: "data-bind"
});;var ApexClassRowView = Backbone.Epoxy.View.extend({
  
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
});;var ApexTableView = Backbone.Epoxy.View.extend({

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
;var Apexs = Backbone.Collection.extend({

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