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

})();