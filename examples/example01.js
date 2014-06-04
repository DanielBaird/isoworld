
var World = function() {

    this.maxSoilDepth = function() {
        return 8;
    };

    this.addTrees = function() {
        // for now, spray some random trees into the grid
        for (treeIndex = 0; treeIndex < 10; treeIndex++) {
            var diam = Math.random();
            var tree = {
                id: treeIndex,
                height: (diam * 30) + Math.random() * (diam * 10),
                diameter: diam
            }
            // pick a random grid point for this tree
            var gX = Math.floor(Math.random() * (this._grid.length));
            var gY = Math.floor(Math.random() * (this._grid[0].length));

            if (! this._grid[gX][gY].trees) {
                this._grid[gX][gY].trees = [];
            }
            console.log(this._grid[gX][gY].trees);
            this._grid[gX][gY].trees.push(tree);
        }
    }

    this.highlight = function(x, y) {
        if (x) {
            // they're setting the highlight
            if (this._highlight) {
                this._grid[this._highlight.x][this._highlight.y].highlighted = false;
            }
            this._highlight = {x: x, y: y};
            this._grid[x][y].highlighted = true;
        }
        // now return the highlighted square
        if (this._highlight) {
            return { x: this._highlight.x, y: this._highlight.y };
        } else {
            return null;
        }
    };

    this.grid = function() {
        return this._grid;
    };

    this._grid = [
        [
            {
                // 0, 0
                waterDepth: 0.4,
                litterHeight: 0,
                altitude: 0
            },{
                // 0, 1
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0
            },{
                // 0, 2
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 0, 3
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0
            },{
                // 0, 4
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 0, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0
            }
        ],[
            {
                // 1, 0
                waterDepth: 0.6,
                litterHeight: 0,
                altitude: 0
            },{
                // 1, 1
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 1, 2
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 1, 3
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 1, 4
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 1, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            }
        ],[
            {
                // 2, 0
                waterDepth: 0.2,
                litterHeight: 0,
                altitude: 0
            },{
                // 2, 1
                waterDepth: 0.1,
                litterHeight: 0,
                altitude: 0.33
            },{
                // 2, 2
                waterDepth: 0.2,
                litterHeight: 0,
                altitude: 0.33
            },{
                // 2, 3
                waterDepth: 0.33,
                litterHeight: 0,
                altitude: 0.33
            },{
                // 2, 4
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 2, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            }
        ],[
            {
                // 3, 0
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0
            },{
                // 3, 1
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 3, 2
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 3, 3
                waterDepth: 0.1,
                litterHeight: 0,
                altitude: 0.33
            },{
                // 3, 4
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 3, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            }
        ],[
            {
                // 4, 0
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0
            },{
                // 4, 1
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 4, 2
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 4, 3
                waterDepth: 0.1,
                litterHeight: 0,
                altitude: 0.33
            },{
                // 4, 4
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 4, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            }
        ],[
            {
                // 5, 0
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 5, 1
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 5, 2
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 5, 3
                waterDepth: 0.05,
                litterHeight: 0,
                altitude: 0.66
            },{
                // 5, 4
                waterDepth: 0,
                litterHeight: 0.33,
                altitude: 0.66
            },{
                // 5, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 1
            }
        ],[
            {
                // 6, 0
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.33
            },{
                // 6, 1
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 1
            },{
                // 6, 2
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 6, 3
                waterDepth: 0.1,
                litterHeight: 0,
                altitude: 0.66
            },{
                // 6, 4
                waterDepth: 0,
                litterHeight: 0.2,
                altitude: 0.66
            },{
                // 6, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 1
            }
        ],[
            {
                // 7, 0
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 7, 1
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 1
            },{
                // 7, 2
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            },{
                // 7, 3
                waterDepth: 0.1,
                litterHeight: 0,
                altitude: 0.66
            },{
                // 7, 4
                waterDepth: 0.3,
                litterHeight: 0,
                altitude: 0.66
            },{
                // 7, 5
                waterDepth: 0,
                litterHeight: 0.1,
                altitude: 0.66
            }
        ]
    ];

};


fetchWorld = function() { return new World(); }
