
/**
 * abstract GameItem
 */
public abstract class GameItem {
    private char img;
    
    public GameItem(char img) {
        this.img = img;
    }
    
    public void display() {
        System.out.printf(" %c", img);
    }
}
