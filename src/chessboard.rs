use notan::{prelude::{Color, Texture, Graphics, TextureFilter, App, Mouse}, draw::{Draw, DrawShapes, DrawImages, Font, CreateFont, DrawTextSection}};

use crate::{pieces::*, move_logic::{get_available_moves, get_all_white_moves, get_all_black_moves, is_white_king_checked, is_black_king_checked}};

pub struct ChessBoard {
    board: [[Piece; 8]; 8],
    square_size: f32,
    pieces_tex: Texture,
    font: Font,
    chosen_piece: Option<(usize, usize)>,
    a_moves_chosen: Vec<Move>,
    turn: bool,
    castling_info: CastlingInfo,
    pawn_upgrade_info: PawnUpgradeInfo,
    en_passants: Vec<EnPassant>,
    game_state: GameState
}

impl ChessBoard {
    pub fn new(gfx: &mut Graphics) -> Self {
        Self {
            board: [[Piece::Empty; 8]; 8],
            
            square_size: gfx.size().0 as f32 / 8.,

            pieces_tex: gfx.create_texture().from_image(include_bytes!("assets/chess_pieces.png")).with_filter(TextureFilter::Linear, TextureFilter::Linear).build().unwrap(),

            font: gfx.create_font(include_bytes!("assets/Ubuntu-B.ttf")).unwrap(),

            chosen_piece: None,
            a_moves_chosen: Vec::<Move>::new(),
            turn: false,

            castling_info: CastlingInfo::default(),

            pawn_upgrade_info: PawnUpgradeInfo { c: 0, upgrade_time: false, piece_pos: (0, 0) },

            en_passants: Vec::<EnPassant>::new(),

            game_state: GameState::Game
        }
    }

    pub fn update(&mut self, app: &mut App) {
        if app.mouse.left_was_pressed() && !self.pawn_upgrade_info.upgrade_time && self.game_state == GameState::Game {
            let (x, y) = ((app.mouse.x / self.square_size) as usize, (app.mouse.y / self.square_size) as usize);
            let mut moved = false;
            
            match self.chosen_piece {
                Some(chosen_piece) => for a_move in &self.a_moves_chosen {
                    if x == a_move.x && y == a_move.y {
                        self.en_passants.clear();

                        let mut castled = false;
                        // Castling pieces
                        for i in 0..=1 {
                            let y = if i == 0 {
                                7
                            } else {
                                0
                            };
                            if self.board[chosen_piece.0][chosen_piece.1] == Piece::King(i) && self.board[a_move.x][a_move.y] == Piece::Rook(i) {
                                if a_move.x > chosen_piece.0 {
                                    self.board[chosen_piece.0][chosen_piece.1] = Piece::Empty;
                                    self.board[a_move.x][a_move.y] = Piece::Empty;
                                    self.board[6][y] = Piece::King(i);
                                    self.board[5][y] = Piece::Rook(i);
                                } else {
                                    self.board[chosen_piece.0][chosen_piece.1] = Piece::Empty;
                                    self.board[a_move.x][a_move.y] = Piece::Empty;
                                    self.board[2][y] = Piece::King(i);
                                    self.board[3][y] = Piece::Rook(i);
                                }

                                castled = true;
                                break;
                            }
                        }

                        // Simpe piece move
                        if !castled {
                            if chosen_piece.0 == 0 && chosen_piece.1 == 7 {
                                self.castling_info.ra1 = true;
                            } else if chosen_piece.0 == 7 && chosen_piece.1 == 7 {
                                self.castling_info.rh1 = true;
                            } else if chosen_piece.0 == 4 && chosen_piece.1 == 7 {
                                self.castling_info.ke1 = true;
                            } else if chosen_piece.0 == 0 && chosen_piece.1 == 0 {
                                self.castling_info.ra8 = true;
                            } else if chosen_piece.0 == 7 && chosen_piece.1 == 0 {
                                self.castling_info.rh8 = true;
                            } else if chosen_piece.0 == 4 && chosen_piece.1 == 0 {
                                self.castling_info.ke8 = true;
                            }

                            // En passant completed
                            if self.board[chosen_piece.0][chosen_piece.1] == Piece::Pawn(1) && chosen_piece.0 != x && self.board[x][y] == Piece::Empty {
                                self.board[x][y - 1] = Piece::Empty;
                            }
                            if self.board[chosen_piece.0][chosen_piece.1] == Piece::Pawn(0) && chosen_piece.0 != x && self.board[x][y] == Piece::Empty {
                                self.board[x][y + 1] = Piece::Empty;
                            }

                            self.board[x][y] = self.board[chosen_piece.0][chosen_piece.1];
                            self.board[chosen_piece.0][chosen_piece.1] = Piece::Empty;

                            // En passants
                            if chosen_piece.1 == 6 && self.board[chosen_piece.0][chosen_piece.1 - 2] == Piece::Pawn(0) {
                                if chosen_piece.0 > 0 && chosen_piece.0 < 7 {
                                    if self.board[chosen_piece.0 - 1][chosen_piece.1 - 2] == Piece::Pawn(1) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 - 1, chosen_piece.1 - 2), target: (chosen_piece.0, chosen_piece.1 - 1) });
                                    }
                                    if self.board[chosen_piece.0 + 1][chosen_piece.1 - 2] == Piece::Pawn(1) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 + 1, chosen_piece.1 - 2), target: (chosen_piece.0, chosen_piece.1 - 1) });
                                    }
                                } else if chosen_piece.0 == 0 {
                                    if self.board[chosen_piece.0 + 1][chosen_piece.1 - 2] == Piece::Pawn(1) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 + 1, chosen_piece.1 - 2), target: (chosen_piece.0, chosen_piece.1 - 1) });
                                    }
                                } else if chosen_piece.0 == 7 {
                                    if self.board[chosen_piece.0 - 1][chosen_piece.1 - 2] == Piece::Pawn(1) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 - 1, chosen_piece.1 - 2), target: (chosen_piece.0, chosen_piece.1 - 1) });
                                    }
                                }
                            }
                            if chosen_piece.1 == 1 && self.board[chosen_piece.0][chosen_piece.1 + 2] == Piece::Pawn(1) {
                                if chosen_piece.0 > 0 && chosen_piece.0 < 7 {
                                    if self.board[chosen_piece.0 - 1][chosen_piece.1 + 2] == Piece::Pawn(0) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 - 1, chosen_piece.1 + 2), target: (chosen_piece.0, chosen_piece.1 + 1) });
                                    }
                                    if self.board[chosen_piece.0 + 1][chosen_piece.1 + 2] == Piece::Pawn(0) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 + 1, chosen_piece.1 + 2), target: (chosen_piece.0, chosen_piece.1 + 1) });
                                    }
                                } else if chosen_piece.0 == 0 {
                                    if self.board[chosen_piece.0 + 1][chosen_piece.1 + 2] == Piece::Pawn(0) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 + 1, chosen_piece.1 + 2), target: (chosen_piece.0, chosen_piece.1 + 1) });
                                    }
                                } else if chosen_piece.0 == 7 {
                                    if self.board[chosen_piece.0 - 1][chosen_piece.1 + 2] == Piece::Pawn(0) {
                                        self.en_passants.push(EnPassant { opponent: (chosen_piece.0 - 1, chosen_piece.1 + 2), target: (chosen_piece.0, chosen_piece.1 + 1) });
                                    }
                                }
                            }
                            
                            // Check for pawn upgrade
                            if chosen_piece.1 == 1 || chosen_piece.1 == 6 {
                                if self.board[x][y] == Piece::Pawn(0) && y == 0 {
                                    self.pawn_upgrade_info.c = 0;
                                    self.pawn_upgrade_info.upgrade_time = true;
                                    self.pawn_upgrade_info.piece_pos = (x, 0);
                                } else if self.board[x][y] == Piece::Pawn(1) && y == 7 {
                                    self.pawn_upgrade_info.c = 1;
                                    self.pawn_upgrade_info.upgrade_time = true;
                                    self.pawn_upgrade_info.piece_pos = (x, 7);
                                }
                            }
                        }
                        self.turn = !self.turn;
                        moved = true;

                        if is_white_king_checked(&self.board, &self.castling_info) && get_all_white_moves(&self.board, true, true, &self.castling_info, true, true).is_empty() {
                            self.game_state = GameState::BlackWon;
                        } else if is_black_king_checked(&self.board, &self.castling_info) && get_all_black_moves(&self.board, true, true, &self.castling_info, true, true).is_empty() {
                            self.game_state = GameState::WhiteWon;
                        } else if !self.turn && !is_white_king_checked(&self.board, &self.castling_info) && get_all_white_moves(&self.board, true, true, &self.castling_info, true, true).is_empty() {
                            self.game_state = GameState::Stalemate;
                        } else if self.turn && !is_black_king_checked(&self.board, &self.castling_info) && get_all_black_moves(&self.board, true, true, &self.castling_info, true, true).is_empty() {
                            self.game_state = GameState::Stalemate;
                        }
                    }
                },
                _ => (),
            }
            
            if self.board[x][y].get_color() != 2 && !moved && self.board[x][y].get_color() == self.turn as u8 {
                self.chosen_piece = Some((x, y));
            } else {
                self.chosen_piece = None;
            }

            match self.chosen_piece {
                Some(chosen_piece) => {
                    self.a_moves_chosen = get_available_moves(&self.board, chosen_piece.0, chosen_piece.1, true, true, true, &self.castling_info);

                    if self.board[chosen_piece.0][chosen_piece.1] == Piece::Pawn(0) || self.board[chosen_piece.0][chosen_piece.1] == Piece::Pawn(1) {
                        for en_passant in &self.en_passants {
                            if chosen_piece.0 == en_passant.opponent.0 && chosen_piece.1 == en_passant.opponent.1 {
                                self.a_moves_chosen.push(Move { x: en_passant.target.0, y: en_passant.target.1 });
                            }
                        }
                    }
                },
                None => self.a_moves_chosen.clear(),
            }
        }

        if app.mouse.right_was_pressed() {
            self.chosen_piece = None;
            self.a_moves_chosen.clear();
        }
    }

    pub fn render(&mut self, draw: &mut Draw, mouse: &Mouse) {
        let a_w_moves = get_all_white_moves(&self.board, false, false, &self.castling_info, true, false);
        let a_b_moves = get_all_black_moves(&self.board, false, false, &self.castling_info, true, false);
        for i in 0..8 {
            for j in 0..8 {
                let c = if (i + j) as i32 % 2 != 0 {
                    Color::from_rgb(161./255., 111./255., 90./255.)
                } else {
                    Color::from_rgb(236./255., 215./255., 185./255.)
                };

                draw.rect((i as f32* self.square_size, j as f32 * self.square_size), (self.square_size, self.square_size)).color(c);

                if self.board[i as usize][j as usize] == Piece::King(1) {
                    if a_w_moves.contains(&Move { x: i as usize, y: j as usize}) {
                        draw.ellipse((i as f32 * self.square_size + self.square_size * 0.5, j as f32 * self.square_size + self.square_size * 0.5), (self.square_size / 2., self.square_size / 2.))
                            .color(Color::from_rgba(0.8, 0.0, 0.0, 0.5));
                    }
                }
                if self.board[i as usize][j as usize] == Piece::King(0) {
                    if a_b_moves.contains(&Move { x: i as usize, y: j as usize}) {
                        draw.ellipse((i as f32 * self.square_size + self.square_size * 0.5, j as f32 * self.square_size + self.square_size * 0.5), (self.square_size / 2., self.square_size / 2.))
                            .color(Color::from_rgba(0.8, 0.0, 0.0, 0.5));
                    }
                }
            }
        }

        match self.chosen_piece {
            Some(chosen_piece) => {
                draw.rect((chosen_piece.0 as f32 * self.square_size, chosen_piece.1 as f32 * self.square_size), (self.square_size, self.square_size))
                    .color(Color::from_rgba(251./255., 242./255., 54./255., 75./255.));
            },
            _ => (),
        }
        

        for i in 0..8 {
            for j in 0..8 {
                let mut offset = (0, 0);
                let mut empty = false;
                match &self.board[i][j] {
                    Piece::Pawn(c) => offset = (5, *c),
                    Piece::Knight(c) => offset = (3, *c),
                    Piece::Queen(c) => offset = (1, *c),
                    Piece::Bishop(c) => offset = (2, *c),
                    Piece::Rook(c) => offset = (4, *c),
                    Piece::King(c) => offset = (0, *c),
                    Piece::Empty => empty = true,
                }
                
                if !empty {
                    let (w, h) = (self.pieces_tex.width() / 6., self.pieces_tex.height() / 2.);
                    draw.image(&self.pieces_tex)
                            .crop((w * offset.0 as f32, h * offset.1 as f32), (w, h))
                            .position(self.square_size * i as f32, self.square_size * j as f32)
                            .size(self.square_size, self.square_size);
                }
            }
        }

        for a_move in &self.a_moves_chosen {
            let (c, s) = if self.board[a_move.x][a_move.y].get_color() == 2 {
                (Color::from_rgba(0.0, 0.0, 0.0, 0.3), self.square_size / 6.) 
            } else {
                (Color::from_rgba(0.8, 0.0, 0.0, 0.5), self.square_size / 16.)
            };

            draw.ellipse((a_move.x as f32 * self.square_size + self.square_size * 0.5, a_move.y as f32 * self.square_size + self.square_size * 0.5), (s, s))
                .color(c);
        }

        match self.game_state {
            GameState::WhiteWon => {
                draw.text(&self.font, "White is victorious!").size(40.).position(self.square_size * 2.5, self.square_size * 3.);
            },
            GameState::BlackWon => {
                draw.text(&self.font, "Black is victorious!").size(40.).position(self.square_size * 2.5, self.square_size * 3.);
            },
            GameState::Stalemate => {
                draw.text(&self.font, "Stalemate").size(40.).position(self.square_size * 2.5, self.square_size * 3.);
            },
            _ => (),
        }

        if self.pawn_upgrade_info.upgrade_time {
            draw.rect((self.square_size * 1.5, self.square_size * 2.5), (self.square_size * 5., self.square_size * 2.)).color(Color::WHITE);

            if hovering(self.square_size * 2., self.square_size * 3., self.square_size, self.square_size, mouse) {
                draw.rect((self.square_size * 2., self.square_size * 3.), (self.square_size, self.square_size)).color(Color::from_rgba(0., 0., 0., 0.2));
                if mouse.left_was_pressed() {
                    self.board[self.pawn_upgrade_info.piece_pos.0][self.pawn_upgrade_info.piece_pos.1] = Piece::Queen(self.pawn_upgrade_info.c);
                    self.pawn_upgrade_info.upgrade_time = false;
                }
            } else if hovering(self.square_size * 3., self.square_size * 3., self.square_size, self.square_size, mouse) {
                draw.rect((self.square_size * 3., self.square_size * 3.), (self.square_size, self.square_size)).color(Color::from_rgba(0., 0., 0., 0.2));
                if mouse.left_was_pressed() {
                    self.board[self.pawn_upgrade_info.piece_pos.0][self.pawn_upgrade_info.piece_pos.1] = Piece::Rook(self.pawn_upgrade_info.c);
                    self.pawn_upgrade_info.upgrade_time = false;
                }
            } else if hovering(self.square_size * 4., self.square_size * 3., self.square_size, self.square_size, mouse) {
                draw.rect((self.square_size * 4., self.square_size * 3.), (self.square_size, self.square_size)).color(Color::from_rgba(0., 0., 0., 0.2));
                if mouse.left_was_pressed() {
                    self.board[self.pawn_upgrade_info.piece_pos.0][self.pawn_upgrade_info.piece_pos.1] = Piece::Bishop(self.pawn_upgrade_info.c);
                    self.pawn_upgrade_info.upgrade_time = false;
                }
            } else if hovering(self.square_size * 5., self.square_size * 3., self.square_size, self.square_size, mouse) {
                draw.rect((self.square_size * 5., self.square_size * 3.), (self.square_size, self.square_size)).color(Color::from_rgba(0., 0., 0., 0.2));
                if mouse.left_was_pressed() {
                    self.board[self.pawn_upgrade_info.piece_pos.0][self.pawn_upgrade_info.piece_pos.1] = Piece::Knight(self.pawn_upgrade_info.c);
                    self.pawn_upgrade_info.upgrade_time = false;
                }
            }

            let (w, h) = (self.pieces_tex.width() / 6., self.pieces_tex.height() / 2.);
            draw.image(&self.pieces_tex)
                            .crop((w * 1. as f32, h * self.pawn_upgrade_info.c as f32), (w, h))
                            .position(self.square_size * 2., self.square_size * 3.)
                            .size(self.square_size, self.square_size);
            draw.image(&self.pieces_tex)
                            .crop((w * 4. as f32, h * self.pawn_upgrade_info.c as f32), (w, h))
                            .position(self.square_size * 3., self.square_size * 3.)
                            .size(self.square_size, self.square_size);
            draw.image(&self.pieces_tex)
                            .crop((w * 2. as f32, h * self.pawn_upgrade_info.c as f32), (w, h))
                            .position(self.square_size * 4., self.square_size * 3.)
                            .size(self.square_size, self.square_size);
            draw.image(&self.pieces_tex)
                            .crop((w * 3. as f32, h * self.pawn_upgrade_info.c as f32), (w, h))
                            .position(self.square_size * 5., self.square_size * 3.)
                            .size(self.square_size, self.square_size);
        }
    }

    pub fn parse_fen(&mut self, fen_n: &str) {
        self.board =  [[Piece::Empty; 8]; 8];

        let (mut x, mut y) = (0, 0);
        for c in fen_n.chars() {
            if c == '/' {
                x = 0;
                y += 1;
            } else if c.is_numeric() {
                x += c as i32 - 0x30;
            } else {
                if c == 'p' || c == 'P' {
                    self.board[x as usize][y as usize] = Piece::Pawn(c.is_lowercase() as u8);
                } else if c == 'r' || c == 'R' {
                    self.board[x as usize][y as usize] = Piece::Rook(c.is_lowercase() as u8);
                } else if c == 'n' || c == 'N' {
                    self.board[x as usize][y as usize] = Piece::Knight(c.is_lowercase() as u8);
                } else if c == 'b' || c == 'B' {
                    self.board[x as usize][y as usize] = Piece::Bishop(c.is_lowercase() as u8);
                } else if c == 'q' || c == 'Q' {
                    self.board[x as usize][y as usize] = Piece::Queen(c.is_lowercase() as u8);
                } else if c == 'k' || c == 'K' {
                    self.board[x as usize][y as usize] = Piece::King(c.is_lowercase() as u8);
                }
                x+=1;
            }
        }
    }
}

fn hovering(x: f32, y: f32, w: f32, h: f32, mouse: &Mouse) -> bool{
    mouse.x > x && mouse.y > y && mouse.x < x + w && mouse.y < y + h
}

#[derive(PartialEq, Debug)]
pub struct Move {
    pub x: usize,
    pub y: usize
}

#[derive(Default)]
pub struct CastlingInfo {
    pub ra1: bool,
    pub rh1: bool,
    pub ke1: bool,
    pub ra8: bool,
    pub rh8: bool,
    pub ke8: bool
}

impl CastlingInfo {
    pub fn king_moved(&self, c: &u8) -> bool {
        if *c == 0 {
            self.ke1
        } else {
            self.ke8
        }
    }
    pub fn a_rook_moved(&self, c: &u8) -> bool {
        if *c == 0 {
            self.ra1
        } else {
            self.ra8
        }
    }

    pub fn h_rook_moved(&self, c: &u8) -> bool {
        if *c == 0 {
            self.rh1
        } else {
            self.rh8
        }
    }
}

struct PawnUpgradeInfo {
    c: u8,
    upgrade_time: bool, 
    piece_pos: (usize, usize)
}

struct EnPassant {
    opponent: (usize, usize),
    target: (usize, usize)
}

#[derive(PartialEq, Debug)]
pub enum GameState {
    Game, WhiteWon, BlackWon, Stalemate
}