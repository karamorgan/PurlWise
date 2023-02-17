const Pattern = require('../models/patternModel');
const Setup = require('../models/setupModel');

const tree = {

    // Accepts the ID of any node in the data tree and returns all nodes beneath it by recursion
    // Pre-order in-depth recursive traversal
    findData: async function(id) {
        try {
            let node = await Pattern.findById(id);
            if(!node) throw new Error('no pattern data found');

            const item = {
                id: node?._id,
                data: node?.data,
                instances: node?.instances,
                children: []
            };

            for(let i = 0; i < node?.children.length; i++) {
                item.children.push(await tree.findData(node.children[i]));
            }

            return item;
        } catch (error) {
            throw error;
        }
    },

    // Retrieves the last row and last row group of a pattern to display on the pattern building page
    getBuildDisplays: async function(req, res, next) {
        try {
            let setup = await Setup.findById(req.params.setupID).populate('pattern');
            if(!setup) throw new Error('no pattern setup found');
            let patternHead = setup.pattern;
            if(!patternHead) res.send({ message: 'no build displays found' });
            else {
                let rowGroup = await Pattern.findById(patternHead.children[patternHead.children.length - 1]);
                let row = await Pattern.findById(rowGroup.children[rowGroup.children.length - 1]);

                let displays = {
                    rowGroup: rowGroup._id,
                    row: row._id
                };

                res.json({ message: 'successfully retrieved build display data', data: displays });
            }
        } catch (error) {
            next(error);
        }
    },

    // Accepts the ID of any node in the data tree and returns all nodes beneath it
    // findData is a separate function because it executes recursively, then returns the result to getData
    getData: async function(req, res, next) {
        try {
            let setup = await Setup.findById(req.params.setupID);
            if(!setup) throw new Error('no pattern found');

            const id = req.params.patternID ?? setup.pattern;
            const result = await tree.findData(id); // this?
            
            res.send({ message: 'successfully retrieved pattern data', data: result });
        } catch (error) {
            next(error);
        }
    },

    // Accepts new stitches to add, and object specifying which row and row group to add to
    // Object can contain both row and row group, neither row nor row group (new pattern), or row group but no row (new row)
    add: async function(req, res, next) {
        try {
            let setup = await Setup.findById(req.params.setupID).populate('pattern'); // Retrieves root of the pattern data tree
            let patternRoot = setup.pattern;
            let rowGroup = await Pattern.findById(req.body.displays.rowGroup); // Retrieves row and row group where specified to add stitches
            let row = await Pattern.findById(req.body.displays.row);
            let stitchSeq = await Pattern.findById(row?.children[row.children.length - 1]); // null if row is null (new pattern or new row)

            if(!patternRoot) { // Will be null if no pattern exists yet
                patternRoot = await Pattern.create({});
                await Setup.findByIdAndUpdate(req.params.setupID, { pattern: patternRoot });
                rowGroup = await Pattern.create({});
                patternRoot.children.push(rowGroup);
            }
            if(!row) { // Will be null if no pattern exists yet or if adding a new row
                row = await Pattern.create({});
                rowGroup.children.push(row);
            }
            if(!stitchSeq || stitchSeq.instances > 1) { // Creates new stitch sequence if new pattern or if last sequence is repeat sequence
                stitchSeq = await Pattern.create({});
                row.children.push(stitchSeq);
            }

            let stitches = await Pattern.create(req.body.stitches);
            stitchSeq.children.push(stitches);

            await stitches.save();
            await stitchSeq.save();
            await row.save();
            await rowGroup.save();
            await patternRoot.save();

            res.send({ message: 'successfully added stitches', data: { rowGroup: rowGroup._id, row: row._id } });
        } catch (error) {
            next(error);
        }
    },

    // Accepts IDs of two stitch-level documents of the same sequence, splits sibling nodes before and after into parallel sequences
    // All nodes between the two, inclusive, become a repeating group of user-specified # of instances
    split: async function(req, res, next) {
        try {
            let first = await Pattern.findById(req.body.first); // First checked box, sequentially
            let last = await Pattern.findById(req.body.last); // Second checked box, sequentially
            const instances = req.body.instances;

            let stitchSeq = await Pattern.findOne({ children: first }); // Existing parent of checked data, i.e. stitch sequence
            let row = await Pattern.findOne({ children: stitchSeq }); 
            let rowGroup = await Pattern.findOne({ children: row });

            // Add new stitch group split before repeat group only if there are other stitches before the first checked box
            if(!first.equals(stitchSeq.children[0])) {
                let split1 = await Pattern.create({});

                // For each child of original stitch group, until new repeat group, remove child from original stitch group (which is now new repeat group) and add it to new stitch group split
                while(!first.equals(stitchSeq.children[0])) {
                    split1.children.push(stitchSeq.children.shift());
                }

                // Insert stitch group split before new repeat group in row children
                let stitchSeqInd = row.children.findIndex(child => stitchSeq.equals(child));
                row.children.splice(stitchSeqInd, 0, split1);

                await split1.save();
            }

            // Add new stitch group split after repeat group only if there are other stitches after the last checked box
            if(!last.equals(stitchSeq.children[stitchSeq.children.length - 1])) {
                let split2 = await Pattern.create({});

                // For each child of original stitch group, after new repeat group, remove child from original stitch group (which is now new repeat group) and add it to new stitch group split
                while(!last.equals(stitchSeq.children[stitchSeq.children.length - 1])) {
                    split2.children.unshift(stitchSeq.children.pop());
                }

                // Insert stitch group split after new repeat group in row children
                let stitchSeqInd = row.children.findIndex(child => stitchSeq.equals(child));
                row.children.splice(stitchSeqInd + 1, 0, split2);

                await split2.save();
            }

            stitchSeq.instances = instances;
            await stitchSeq.save();
            await row.save();

            res.send({ message: 'successfully split sequences', data: { rowGroup: rowGroup._id, row: row._id } });
        } catch (error) {
            next(error);
        }
    },

    // Accepts pattern setup ID, traverses the pattern to create an array of IDs of every document contained
    // Then deletes all corresponding documents from the database, and deletes progress and pattern head reference from setup
    delete: async function(req, res, next) {
        try {
            let setup = await Setup.findById(req.params.setupID);
            if(!setup) throw new Error('no pattern found');
    
            if(setup.pattern) {
                let toDelete = await traverse(setup.pattern);
                await Pattern.deleteMany({ _id: { $in: toDelete } });
                setup.pattern = null;
                setup.progress = 0;
                setup.save();

                async function traverse(rootID, arr = []) {
                    let root = await Pattern.findById(rootID);
                    for(const child of root.children) {
                        arr = arr.concat(await traverse(child));
                    }
                    return arr.concat(root);
                };
    
                res.send({ message: 'successfully deleted pattern contents' });
            } else res.send({ message: 'no pattern contents to delete' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = { tree };