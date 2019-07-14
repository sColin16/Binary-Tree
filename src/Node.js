/***
 * Node.js
 *
 * This file defines the Node class. Nodes serve as the building blocks of the
 * binary tree. The Node has basic data structure properties that would be
 * required of a non-visual node object. This includes storing its value, and
 * storing references to its left and right children. A node is said to be
 * filled if it contains a value other than null. When a node is filled, it will
 * create two empty (not filled) nodes as it children. This allows recursive
 * calls to simply check if the node being processed is filled, rather than
 * checking that each left and right child of a node has been defined.
 *
 * Nodes also store information that is necessary to visualize them. This
 * includes all the properties of the appearance of the circle which represents
 * the node (e.g. size, color, outline), as well as properties that are
 * necessary to visualize the edge connecting the node to its parent.
***/

class Node {
    // Note: this section uses the static keyword to define static properties.
    // Although perhaps not the intended function, it makes defining static
    // properties much more readable than adding them at the end

    // Constants that control the default appearance of the nodes
    static SIZE = 20;                    // Diameter of the nodes
    static COLOR = color(255, 255, 255); // Fill color of the nodes
    static STROKE = color(0, 0, 0, 0);   // Outline color of the nodes
    static TEXTSIZE = 10;                // Text size of the node values
    static TEXTCOLOR = color(0, 0, 0);   // Text color of the node values
    static EDGECOLOR = color(0, 0, 0);   // Color of this node's upper edge
    static EDGETHICKNESS = 2;            // Thickness this node's upper edge

    // Color-related constants for visualization purposes
    static VISITED = color(0, 0, 255);  // Color when this node has been visited
    static SUCCESS = color(0, 255, 0);  // Color when this node was added/the
                                        //   value inside was being searched for
    static FAILURE = color(255, 0, 0);  // Color when the value being searched
                                        //   for is not found in this node

    // Constants controlling the positions of the nodes relative to one another
    static HORIZONTALSPACING = 15; // Horizontal distance between two nodes
    static VERTICALSPACING = 50;   // Vertical distance between tow nodes

    constructor(graphicsBuffer, parent = null, size = Node.SIZE,
                 color = Node.COLOR, stroke = Node.STROKE,
                 textSize = Node.TEXTSIZE, textColor = Node.TEXTCOLOR,
                 edgeColor = Node.EDGECOLOR,
                 edgeThickness = Node.EDGETHICKNESS) {

        this.value = null;     // The value this node is holding

        // Reference to left/right children on this node
        this.leftNode = null;
        this.rightNode = null;

         // The off-screen buffer this node should draw itself to
        this.graphicsBuffer = graphicsBuffer;

        // A reference to the parent for drawing purposes
        this.parent = parent;

        // x and y coordinates to draw the node at
        this.x = 0;
        this.y = 0;

         // The horizontal space between this node and its left/right children
        this.rightSpacing = 0;
        this.leftSpacing = 0;

        // The total horizontal space all nodes below this node use in either direction
        this.cumulativeRightSpacing = 0;
        this.cumulativeLeftSpacing = 0;

        // Properties controlling the appearance of the node
        this.size = size;
        this.color = color;
        this.stroke = stroke;
        this.textSize = textSize;
        this.textColor = textColor;

        // Properties controlling the appearance of the upper edge of this node
        this.edgeColor = edgeColor;
        this.edgeThickness = edgeThickness;
    }

    // Definition of a "filled" node that should be processed recursively
    isFilled() {
        return this.value !== null;
    }

    // Checks if a node has a parent, or is the root of a tree
    hasParent() {
        return this.parent !== null;
    }

    /***
     * Adds the specified value to the structure at or below this node
     *
     * Returns: The highest-level node whose coordinates (and children's
     * coordinates) must be adjusted to account for the addition of the new node.
     *
     * Returning the highest-level that needs to be adjusted increases
     * performance, because the coordinates of only a subset of the tree must
     * be recalculated
    ***/
    addValue(value) {
        if (!this.isFilled()) {
            // If the node hasn't been filled yet, fill this node with the value
            // This node needs to have its coordinates set, to return this

            this.value = value;
            this.leftNode = new Node(this.graphicsBuffer, this);
            this.rightNode = new Node(this.graphicsBuffer, this);

            return this;

        } else if (value < this.value) {
            // The value is less than this node's value, so it belongs to the left

            var initialLeftSpacing = this.leftNode.cumulativeRightSpacing
                + Node.HORIZONTALSPACING;

            // Add this value to the left half of the tree
            var shiftedNode = this.leftNode.addValue(value);

            // To prevent overlapping nodes, the left child should be offset
            // slightly farther to the left than all the space taken up to the
            // right of the left node
            this.leftSpacing = this.leftNode.cumulativeRightSpacing
                + Node.HORIZONTALSPACING;

            // Update total spacing taken up to the left of this node
            this.cumulativeLeftSpacing = this.leftNode.cumulativeLeftSpacing
                + this.leftSpacing;

            // If this node's left spacing changed, then the coordinates of its
            // left child must be updated to account for this change, so return
            // the left child
            if(this.leftSpacing !== initialLeftSpacing) {
                return this.leftNode;
            }

            // If the left spacing didn't change, return the lower node that
            // needs to be adjusted
            return shiftedNode;

        } else if(value > this.value){
            // The value is greater than this node's value, so it belongs to the left

            // The code below parallels the code above, but handles adding nodes
            // to the right half of this node

            var rightSpacing = this.rightNode.cumulativeLeftSpacing
                + Node.HORIZONTALSPACING;

            var shiftedNode = this.rightNode.addValue(value);

            this.rightSpacing = this.rightNode.cumulativeLeftSpacing
                + Node.HORIZONTALSPACING;

            this.cumulativeRightSpacing = this.rightNode.cumulativeRightSpacing
                + this.rightSpacing;

            if(this.rightSpacing !== rightSpacing) {
                return this.rightNode;
            }

            return shiftedNode;
        }
    }

    // Recursively sets the coordinates of this node and all nodes below it.
    // If no coordinates are supplied, the coordinates are based on the parent
    // node's location and spacing. If coordinates are supplied, the coordinates
    // are se to the specified values.
    // This function is called by the Tree class after a value is inserted
    // to position the nodes in the tree correctly
    setCoordinates(x, y) {
        if(this.isFilled()) {
            if(typeof x === "undefined" && typeof y === "undefined") {
                // No coordinates were passed into the function
                if(this.value < this.parent.value) {
                    // Left node
                    this.x = this.parent.x - this.parent.leftSpacing;
                } else {
                    // Right node
                    this.x = this.parent.x + this.parent.rightSpacing;
                }

                this.y = this.parent.y + Node.VERTICALSPACING;

            } else {
                // Coordinates were passed into the function
                this.x = x;
                this.y = y;
            }

            this.leftNode.setCoordinates();
            this.rightNode.setCoordinates();
        }
    }

    /***
     * Recursively searches the tree for the specified value
     *
     * Returns: Boolean; if value was found in the tree (true) or not (false)
    ***/
    search(value) {
        if (!this.isFilled()) {
            return false;

        } else if (this.value === value) {
            return true;

        } else if (value < this.value) {
            return this.leftNode.search(value);

        } else if (value > this.value) {
            return this.rightNode.search(value);
        }
    }

    // Draws this node's upper level edge, if the node has a parent
    drawEdge() {
        if (this.hasParent()) {
            this.graphicsBuffer.stroke(this.edgeColor);
            this.graphicsBuffer.strokeWeight(this.edgeThickness);
            this.graphicsBuffer.line(this.x, this.y, this.parent.x, this.parent.y);
        }
    }

    // Draws this node's circular face
    drawNode() {
        this.graphicsBuffer.fill(this.color);
        this.graphicsBuffer.stroke(this.stroke);
        this.graphicsBuffer.ellipse(this.x, this.y, this.size, this.size);

        this.graphicsBuffer.noStroke();
        this.graphicsBuffer.fill(this.textColor);
        this.graphicsBuffer.textAlign(CENTER, CENTER);
        this.graphicsBuffer.textSize(this.textSize);
        this.graphicsBuffer.text(this.value, this.x, this.y + 1);
    }

    // Recursively draws this node and all nodes below it
    // Note: the parent of the node originally calling this function must be
    // redrawn, because the edge will cover the parent node. Use redraw()
    // if you want to redraw a single node
    draw() {
        if(this.isFilled()) {
            this.leftNode.draw();
            this.rightNode.draw();

            this.drawEdge();
            this.drawNode();
        }
    }

    // Redraws a singular node on the tree with no side-effects
    redraw() {
        if(this.isFilled()) {
            this.drawEdge();

            this.drawNode();

            if(this.hasParent()) {
                this.parent.drawNode();
            }
        }
    }

    // Recursively sets the color and edge color of this node and all nodes
    // below it to the specified color
    recursivePaint(color) {
        if(this.isFilled()) {
            this.color = color;
            this.edgeColor = color;

            this.leftNode.recursivePaint(color);
            this.rightNode.recursivePaint(color);
        }
    }

    // Sets the color and edge color of this node, and redraws the node
    paint(color) {
        this.color = color;
        this.edgeColor = color;

        this.redraw();
    }

    // Recursively set the appearnace of this node and all nodes below it to
    // defaults for the class
    resetVisuals() {
        if(this.isFilled()) {
            this.size = Node.SIZE;
            this.color = Node.COLOR;
            this.stroke = Node.STROKE;
            this.textSize = Node.TEXTSIZE;
            this.textColor = Node.TEXTCOLOR;

            this.edgeColor = Node.EDGECOLOR;
            this.edgeThickness = Node.EDGETHICKNESS;

            this.leftNode.resetVisuals();
            this.rightNode.resetVisuals();
        }
    }
}
