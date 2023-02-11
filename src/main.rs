mod chessboard;
pub mod pieces;
pub mod move_logic;

use chessboard::ChessBoard;
use notan::{AppState, prelude::{Graphics, App, WindowConfig}, notan_main, draw::{DrawConfig, CreateDraw}};


#[derive(AppState)]
struct State {
    chessboard: ChessBoard
}

impl State {
    fn new(gfx: &mut Graphics) -> Self {
        let mut chessboard = ChessBoard::new(gfx);
        chessboard.parse_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
        //chessboard.parse_fen("r3k2r/pppppppp/8/4q/8/8/PPPP1PPP/R2BK2R");
        //chessboard.parse_fen("1p/P/8/8/8/8/4p/8");
        //chessboard.parse_fen("8/pppppppp/8/8/3P/8/PPP1PPPP/8");
        
        Self {
            chessboard
        }
    }
}

fn update(app: &mut App, state: &mut State) {
    state.chessboard.update(app);
}

fn draw(app: &mut App, gfx: &mut Graphics, state: &mut State) {
    let mut draw = gfx.create_draw();

    state.chessboard.render(&mut draw, &app.mouse);

    gfx.render(&draw);
}

#[notan_main]
fn main() -> Result<(), String> {
    notan::init_with(State::new)
        .add_config(WindowConfig::new().vsync(true).size(800, 800).title("Chess").multisampling(8).resizable(false))
        .add_config(DrawConfig)
        .update(update)
        .draw(draw)
        .build()
}