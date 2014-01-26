var Apex = Backbone.Epoxy.Model.extend({
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
