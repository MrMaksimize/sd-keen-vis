(function() {
  Polymer({

    is: 'sd-keen-vis',

    properties: {
        /**
        * This property keeps track of the number of clicks.
        *
        * @property counterValue
        */
        counterValue: {
            type: Number,
            value: 0,
            notify: true
        },
        project: {
            type: String
        },
        readKey: {
            type: String
        },
        collection: {
            type: String
        },
        analysisType: {
            type: String
        },
        timeframe: {
            type: String
        },
        interval: {
            type: String
        },
        chartData: {
            type: Object,
            notify: true,
            reflectToAttribute: true,
            value: function() {
                return {}
            }
            //readOnly: true
        },
        seriesConfig: {
            type: Object,
            notify: true,
            reflectToAttribute: true
            //readOnly: true
        }
    },
    observers: [
        '_initClient(project, key)',
        '_updateQuery(collection, analysisType)'
    ],
    created: function() {
        this.config = {};
    },
    ready: function() {
        Keen.ready(function() {
            // TODO -- maybe move this out to updateQuery
            console.log('Keen ready');
        }.bind(this));
    },
    attached: function() {
       console.log('attached');
       this._updateQuery();
    },
    _initClient: function() {
        console.log('initClient');
        this.client = new Keen({
            projectId: this.project,
            readKey: this.readKey
        });
       this._updateQuery();
    },
    _updateQuery: function() {
        if (!this.client) {
            this._initClient()
        }
        else {
            this.query = new Keen.Query(this.analysisType, {
                event_collection: this.collection,
                timeframe: this.timeframe,
                //targetProperty: this.property,
                interval: this.interval
                //groupBy: this.group,
                //filters: this.filters
            });
            console.log(this.query);
            console.log(this.$.chartcanvas);
            this._runQuery();
        }
    },
    _runQuery: function() {
        if (this.client) {
            this.client.run(this.query, function(err, res){
                if (err) {
                    // there was an error!
                    console.log(err);
                }
                else {
                    console.log(res.result);
                    var result = res.result;
                    console.log(result);
                    result = _.map(result, function(n) {
                        n = {
                            'x': parseInt(moment(n.timeframe.start).format('x')),
                            'y': n.value
                        }
                        return n;
                    })
                    var seriesConfig = {
                        "seriesKey": {  //seriesKey is a unique identifier for the configuration
                            "type": "line",  //line or scatter
                            "name": "My Series",  //human readable name
                            "x": "x",  //index or key name for independent variable
                            "y": "y",  //index or key name for dependent variable
                            //"xAxisUnit": "Volt", //Unit to be used for the X axis. Can be ignored if x axis is time based
                            "yAxisUnit": "Oranges", //unit to be used for the Y axis.
                            //"color": "rgb(0,0,0)", //color you want the chart
                            "axis": {
                                "id": "AXIS_ID",   //a unique identifier
                                "side": "left",    //the side that you want the axis to draw on, `left` or `right`
                                "number": 1       //the order of the axis on each side
                            }
                        }
                    }

                    this.set('seriesConfig', seriesConfig);
                    this.set('chartData', result);
                }
            }.bind(this));
        }
    },

    /**
    * Handles click on the element defined in 'on-click' on the template.
    *
    * @method handleClick
    */
    handleClick: function(event, detail, sender) {
      this.increment();
    },

    /**
    * Increments the counter
    *
    * @method increment
    */
    increment: function() {
      this.counterValue++;
    }
  });
})();
