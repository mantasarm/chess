//#![windows_subsystem = "windows"]
mod chessboard;
pub mod pieces;
pub mod move_logic;

use chessboard::ChessBoard;
use notan::{AppState, prelude::{Graphics, App, WindowConfig, RenderTexture, TextureFilter, Color}, notan_main, draw::{DrawConfig, CreateDraw, DrawImages}};


#[derive(AppState)]
struct State {
    chessboard: ChessBoard,
    render_texture: RenderTexture
}

impl State {
    fn new(gfx: &mut Graphics) -> Self {
        let mut chessboard = ChessBoard::new(gfx);
        chessboard.parse_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
        
        Self {
            chessboard,
            render_texture: gfx.create_render_texture(800, 800).with_filter(TextureFilter::Linear, TextureFilter::Linear).build().unwrap()
        }
    }
}

fn update(app: &mut App, state: &mut State) {
    state.chessboard.update(app);
}

fn draw(app: &mut App, gfx: &mut Graphics, state: &mut State) {
    let mut render_draw = state.render_texture.create_draw();

    state.chessboard.render(&mut render_draw, &app.mouse);

    gfx.render_to(&state.render_texture, &render_draw);

    let mut draw = gfx.create_draw();

    let texture = state.render_texture.texture();

    draw.clear(Color::from_rgb(37./255., 37./255., 38./255.));
    
    if app.window().width() >= 800 {
        draw.image(&texture).position(app.window().width() as f32 / 2. - 400., app.window().height() as f32 / 2. - 400.);
    } else {
        draw.image(&texture).size(app.window().width() as f32, app.window().width() as f32).position(0., app.window().height() as f32 / 2. - app.window().width() as f32 / 2.);
    }

    gfx.render(&draw);
}

#[notan_main]
fn main() -> Result<(), String> {
    notan::init_with(State::new)
        .add_config(WindowConfig::new().vsync(true).title("Chess").multisampling(4).resizable(true).maximized(true))
        .add_config(DrawConfig)
        .update(update)
        .draw(draw)
        .build()
}