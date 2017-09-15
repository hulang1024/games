import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import java.util.Scanner;
import java.util.Set;

import static java.lang.System.*;

public class Game {
    private static final int BOARD_ROWS = 4;
    private static final int BOARD_COLS = 4;
    private GameItem[][] board = new GameItem[BOARD_ROWS][BOARD_COLS];
    
    private int playerRow;
    private int playerCol;
    private int score;
    
    private int level = 1;
    private boolean isQuit = false;
    private boolean isOver = false;
    
    
    public void run() {
        score = 0;
        setBoard();
        showMenu();
        doLoop();
        
        if (isOver) {
            gameOver();
        } else if (isQuit) {
            out.println("Bye bye");
        }
    }

    private void setBoard() {
        for (int r = 0; r < BOARD_ROWS; r++)
            for (int c = 0; c < BOARD_COLS; c++)
                board[r][c] = new ClearGround();
        
        // random number of game item.
        int nWumpus = randomIntRange(1, level * 2 + 1);
        int nGold = randomIntRange(1, 4);
        int nPit = 3;
        
        Random rand = new Random(System.currentTimeMillis());
        
        // random coords
        int indexs[] = new int[BOARD_ROWS * BOARD_COLS];
        for (int index = 0; index < indexs.length; index++) {
            indexs[index] = index;
        }
        int randCoords[][] = new int[nWumpus + nGold + nPit][2]; // [0] -> row, [1] -> col
        for (int i = 0; i < randCoords.length; i++) {
            int ri = rand.nextInt(BOARD_ROWS * BOARD_COLS);
            randCoords[i][0] = indexs[ri] / BOARD_COLS;
            randCoords[i][1] = indexs[ri] % BOARD_COLS;
            indexs[ri] = indexs[indexs.length - i - 1];
        }
        // set game item
        int coordsIndex = 0;
        for (int n = 0; n < nWumpus; n++) {
            board[randCoords[coordsIndex][0]][randCoords[coordsIndex][1]] = new Wumpus();
            coordsIndex++;
        }
        for (int n = 0; n < nGold; n++) {
            board[randCoords[coordsIndex][0]][randCoords[coordsIndex][1]] = new Gold();
            coordsIndex++;
        }
        for (int n = 0; n < nPit; n++) {
            board[randCoords[coordsIndex][0]][randCoords[coordsIndex][1]] = new Pit();
            coordsIndex++;
        }
        
        // random player coord
        do {
            playerRow = rand.nextInt(BOARD_ROWS);
            playerCol = rand.nextInt(BOARD_COLS);
        } while (!(board[playerRow][playerCol] instanceof ClearGround));
    }
    
    private void display() {
        out.println("Now World: ");
        out.print("┌");
        for (int c = 0; c < BOARD_COLS * 2; c++)
            out.print("─");
        out.print("┐");
        out.println();

        for (int r = 0; r < BOARD_ROWS; r++) {
            out.print("│");
            for (int c = 0; c < BOARD_COLS; c++) {
                if (r == playerRow && c == playerCol)
                    out.print(" *");
                else
                    board[r][c].display();
            }
            out.print("│");
            out.println();
        }
        
        out.print("└");
        for (int c = 0; c < BOARD_COLS * 2; c++)
            out.print("─");
        out.print("┘");
        out.println();
    }
    
    private void senseNearby() {
        List<GameItem> aroundObjects = new ArrayList<GameItem>();
        if (playerRow > 0) 
            aroundObjects.add(board[playerRow - 1][playerCol]);
        if (playerRow < BOARD_ROWS - 1)
            aroundObjects.add(board[playerRow + 1][playerCol]);
        if (playerCol > 0)
            aroundObjects.add(board[playerRow][playerCol - 1]);
        if (playerCol < BOARD_COLS -1)
            aroundObjects.add(board[playerRow][playerCol + 1]);
        
        Set<String> senseDescSet = new HashSet<String>();
        for (GameItem obj : aroundObjects) {
            if (obj instanceof Wumpus) {
                senseDescSet.add("vile smell");
            } else if (obj instanceof Pit) {
                senseDescSet.add("breeze");
            } else if (obj instanceof Gold) {
                senseDescSet.add("faint glitter");
            }
        }
        
        StringBuilder senseDescs = new StringBuilder();
        for (Iterator<String> iter = senseDescSet.iterator(); ; ) {
            if (!iter.hasNext())
                break;
            senseDescs.append(iter.next());
            if (iter.hasNext())
                senseDescs.append(",");
        }
        
        
        out.printf("Score: %d\n", score);
        out.printf("Position(x,y):(%d,%d)", playerCol + 1, playerRow + 1);
        if (senseDescs.length() > 0)
            out.printf("  (Sense %s.)", senseDescs);
        out.println();
    }
    
    private void showMenu() {
        out.println("=====Wumpus Operation Menu====");
        out.println("1/A = Move player left");
        out.println("2/D = Move player right");
        out.println("3/W = Move player up");
        out.println("4/S = Move player down");
        out.println("5/Q = Quit");
        out.println("6/M = Show Menu");
    }
    
    private void doLoop() {
        @SuppressWarnings("resource")
        Scanner scanner = new Scanner(in);
        String input;
        GameItem object;
        final String pormpt = "> ";
        while (true) {
            display();
            senseNearby();
            
            out.printf(pormpt);
            input = scanner.next();
            for (int i = 0, len = input.length(); i < len; i++) {
                switch ( input.charAt(i) ) {
                case '1': case 'A': case 'a':
                    playerCol = playerCol == 0 ? BOARD_COLS - 1 : playerCol - 1;
                    break;
                case '2': case 'D': case 'd':
                    playerCol = playerCol == BOARD_COLS - 1 ? 0 : playerCol + 1;
                    break;
                case '3': case 'W': case 'w':
                    playerRow = playerRow == 0 ? BOARD_ROWS - 1 : playerRow - 1;
                    break; 
                case '4': case 'S': case 's':
                    playerRow = playerRow == BOARD_ROWS - 1 ? 0 : playerRow + 1;
                    break;
                case '5': case 'Q': case 'q':
                    isQuit = true;
                    return;
                case '6': case 'M': case 'm':
                    showMenu();
                    break;
                default:
                    ;
                }
                
                object = board[playerRow][playerCol];
                if (object instanceof Wumpus) {
                    isOver = true;
                    return;
                } else if (object instanceof Pit) {
                    isOver = true;
                    return;
                } else if (object instanceof Gold) {
                    score++;
                    board[playerRow][playerCol] = new ClearGround();
                }
            }
        }
    }
    
    private void gameOver() {
        out.print("Game Over!");
        out.printf("  Score: %d\n", score);
    }

    /**
     * @return random of [m, n)
     */
    private static int randomIntRange(int m, int n) {
        Random rand = new Random(System.currentTimeMillis());
        return m + rand.nextInt(n - m);
    }
}
