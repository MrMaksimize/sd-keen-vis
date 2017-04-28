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
        timeFrame: {
            type: String
        },
        interval: {
            type: String
        }
    },
    observers: [
        //TODO -- these three should be an object
        '_initClient(project, key)',
        '_updateQuery(collection, analysisType)'
    ],
    created: function() {
        this.config = {};
    },
    ready: function() {
        Keen.ready(function() {
            console.log('Keen ready.');
        });
    },
    _initClient: function() {
        console.log('initClient');
        this.client = new Keen({
            projectId: this.project,
            readKey: this.readKey
        });
    },
    _updateQuery: function() {
        this.query = new Keen.Query(this.analysisType, {
            event_collection: this.collection,
            timeframe: this.timeFrame,
            //targetProperty: this.property,
            interval: this.interval
            //groupBy: this.group,
            //filters: this.filters
        });
        this._runQuery();
    },
    _runQuery: function() {
        if (!this.client) {
            this._initClient();
        }
        this.client.run(this.query, function(err, res){
            if (err) {
                // there was an error!
                console.log('Stupid error.')
                console.log(err);
            }
            else {
                console.log(res.result)
            }
        });
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
