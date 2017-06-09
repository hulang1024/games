
/**
@class 2D vector
*/
function Vector2(x, y)
{
    this.x = x;
    this.y = y;
}
/**
Add two vectors
*/
Vector2.add = function (v1, v2)
{
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
}
Vector2.prototype.add = function (v)
{
    return new Vector2(this.x + v.x, this.y + v.y);
}
