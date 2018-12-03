cc.PageTurn = cc.Grid3D.extend({
	mHOffsetX : 0,
	mHOffsetY : 0,
	ctor:function(gridSize, texture, flipped){
		cc.Grid3D.prototype.ctor.call(this);
		if(gridSize !== undefined)
			this.initWithSize(gridSize, texture, flipped);
	},

	calculateHorizontalVertexPoints:function (offsetX,offsetZ) {
		var R2 =100;
		var offsetX2 = 700;
		var pivotX2 = 640 - offsetX;
		var w = this.getGridSize().width
		for (var i = 0; i <= w; ++i)
		{
			cc.log("cccccccccccccccccc")
			for (var j = 0; j <= this.getGridSize().height; ++j)
			{
				// Get original vertex
				//var point = cc.p(i, j);
				var p = this.getOriginalVertex(cc.p(i,j));
				cc.log("qqqqqqqqqqqqqqqqqqqqqqqqq"+p)
				cc.log(p);
				var l = p.y - pivotX2;
				var alpha = l / R2;
				if (l >= 0) {
					if (alpha > Math.PI) {
						p.y = 0 + pivotX2 - R2 * (alpha - Math.PI);
						p.z = 2 * R2 / 9 ;
						p.x = p.x + 1;
					}
					else if (alpha <= Math.PI)
					{
						p.y = 0 + pivotX2 + R2 * Math.sin(alpha);
						p.z = (R2 - R2 * Math.cos(alpha))/9 ;
						p.x = p.x + 0;
					}
				}
				else
				{
					p.x = p.x + 0;
					p.y = p.y + 0;
					p.z = p.z + offsetZ;
				}
				cc.log("wwwwwwwwwwwwwwwwwwwwwwwwwww")
				// Set new coords
				this.setVertex(cc.p(i,j), p);
				cc.log("ddddddddddddddddddddddddd")



			}
		}


	},

	create1:function(gridSize){
		var ret = new PageTurn();
		ret.initWithSize(gridSize);
		return ret;
	},
	
	
	
	
	
});