use crate::{pieces::Piece, chessboard::{Move, CastlingInfo}};

pub fn rook_movement(board: &[[Piece; 8]; 8], x: usize, y: usize, c: &u8, move_array: &mut Vec<Move>) {
    for i in 1..=(7 - x) {
         if *c == board[x + i][y].get_color() {
             break;
         } else if *c != board[x + i][y].get_color() && board[x + i][y].get_color() != 2 {
             move_array.push(Move { x: x + i, y});
             break;
         }
         move_array.push(Move { x: x + i, y});
     }
     for i in 1..=x {
         if *c == board[x - i][y].get_color() {
             break;
         } else if *c != board[x - i][y].get_color() && board[x - i][y].get_color() != 2 {
             move_array.push(Move { x: x - i, y});
             break;
         }
         move_array.push(Move { x: x - i, y});
     }
     for j in 1..=(7 - y) {
         if *c == board[x][y + j].get_color() {
             break;
         } else if *c != board[x][y + j].get_color() && board[x][y + j].get_color() != 2 {
             move_array.push(Move { x, y: y + j});
             break;
         }
         move_array.push(Move { x, y: y + j});
     }
     for j in 1..=y {
         if *c == board[x][y - j].get_color() {
             break;
         } else if *c != board[x][y - j].get_color() && board[x][y - j].get_color() != 2 {
             move_array.push(Move { x, y: y - j});
             break;
         }
         move_array.push(Move { x, y: y - j});
     }
 }

 pub fn bishop_movement(board: &[[Piece; 8]; 8], x: usize, y: usize, c: &u8, move_array: &mut Vec<Move>) {
     for i in 1..=(if 7 - x > y { y } else { 7 - x}) {
         if *c == board[x + i][y - i].get_color() {
             break;
         } else if *c != board[x + i][y - i].get_color() && board[x + i][y - i].get_color() != 2 {
             move_array.push(Move { x: x + i, y: y - i});
             break;
         }
         move_array.push(Move { x: x + i, y: y - i});
     }
     for i in 1..=(if  x > y { y } else { x}) {
         if *c == board[x - i][y - i].get_color() {
            break;
         } else if *c != board[x - i][y - i].get_color() && board[x - i][y - i].get_color() != 2 {
            move_array.push(Move { x: x - i, y: y - i});
            break;
         }
         move_array.push(Move { x: x - i, y: y - i});
     }
     for i in 1..=(if 7 - x > 7 - y { 7 - y } else { 7 - x}) {
         if *c == board[x + i][y + i].get_color() {
             break;
         } else if *c != board[x + i][y + i].get_color() && board[x + i][y + i].get_color() != 2 {
             move_array.push(Move { x: x + i, y: y + i});
             break;
         }
         move_array.push(Move { x: x + i, y: y + i});
     }
     for i in 1..=(if x > 7 - y { 7 - y } else { x}) {
         if *c == board[x - i][y + i].get_color() {
             break;
         } else if *c != board[x - i][y + i].get_color() && board[x - i][y + i].get_color() != 2 {
             move_array.push(Move { x: x - i, y: y + i});
             break;
         }
         move_array.push(Move { x: x - i, y: y + i});
     }
 }

pub  fn knigth_movement(board: &[[Piece; 8]; 8], x: usize, y: usize, c: &u8, move_array: &mut Vec<Move>) {
     let in_bound = |x: i8, y: i8| -> bool {
         if x >= 0 && x <= 7 && y >= 0 && y <= 7 {
             return true;
         }
         false
     };

     if in_bound(x as i8 + 1, y as i8 - 2) {
         if board[x + 1][y - 2].get_color() != *c {
             move_array.push(Move { x: x + 1, y: y - 2});
         }
     }
     if in_bound(x as i8 + 2, y as i8 - 1) {
         if board[x + 2][y - 1].get_color() != *c {
             move_array.push(Move { x: x + 2, y: y - 1});
         }
     }
     if in_bound(x as i8 - 1, y as i8 - 2) {
         if board[x - 1][y - 2].get_color() != *c {
             move_array.push(Move { x: x - 1, y: y - 2});
         }
     }
     if in_bound(x as i8 - 2, y as i8 - 1) {
         if board[x - 2][y - 1].get_color() != *c {
             move_array.push(Move { x: x - 2, y: y - 1});
         }
     }
     if in_bound(x as i8 + 2, y as i8 + 1) {
         if board[x + 2][y + 1].get_color() != *c {
             move_array.push(Move { x: x + 2, y: y + 1});
         }
     }
     if in_bound(x as i8 + 1, y as i8 + 2) {
         if board[x + 1][y + 2].get_color() != *c {
             move_array.push(Move { x: x + 1, y: y + 2});
         }
     }
     if in_bound(x as i8 - 1, y as i8 + 2) {
         if board[x - 1][y + 2].get_color() != *c {
             move_array.push(Move { x: x - 1, y: y + 2});
         }
     }
     if in_bound(x as i8 - 2, y as i8 + 1) {
         if board[x - 2][y + 1].get_color() != *c {
             move_array.push(Move { x: x - 2, y: y + 1});
         }
     }
 }

 pub fn king_movement(board: &[[Piece; 8]; 8], x: usize, y: usize, c: &u8, move_array: &mut Vec<Move>, check_unavailabe: bool, castling_info: &CastlingInfo) {
     if x > 0 {
         if board[x - 1][y].get_color() != *c {
             move_array.push(Move { x: x - 1, y});
         }
     }
     if x < 7 {
         if board[x + 1][y].get_color() != *c {
             move_array.push(Move { x: x + 1, y});
         }
     }
     if y > 0 {
         if board[x][y - 1].get_color() != *c {
             move_array.push(Move { x, y: y - 1});
         }
     }
     if y < 7 {
         if board[x][y + 1].get_color() != *c {
             move_array.push(Move { x, y: y + 1});
         }
     }
     if x > 0 && y > 0 {
         if board[x - 1][y - 1].get_color() != *c {
             move_array.push(Move { x: x - 1, y: y - 1});
         }
     }
     if x < 7 && y > 0 {
         if board[x + 1][y - 1].get_color() != *c {
             move_array.push(Move { x: x + 1, y: y - 1});
         }
     }
     if x < 7 && y < 7 {
         if board[x + 1][y + 1].get_color() != *c {
             move_array.push(Move { x: x + 1, y: y + 1});
         }
     }
     if x > 0 && y < 7 {
         if board[x - 1][y + 1].get_color() != *c {
             move_array.push(Move { x: x - 1, y: y + 1});
         }
     }

     if check_unavailabe {
        // Remove all the moves that are covered by enemy pieces
        let o_moves = if *c == 0 {
           get_all_black_moves(board, false, false, castling_info, true)
        } else {
           get_all_white_moves(board, false, false, castling_info, true)
        };

        let mut indices = Vec::<usize>::new();

        for (i, a_move) in move_array.iter_mut().enumerate() {
            if o_moves.contains(a_move) {
                indices.push(i);
            }
        }
        indices.reverse();
        for i in indices {
            move_array.remove(i);
        }

        // Remove king moves that still result in check
        indices = Vec::<usize>::new();
        for (j, a_move) in move_array.iter().enumerate() {
            let mut board_copy = board.clone();
            board_copy[x][y] = Piece::Empty;
            board_copy[a_move.x][a_move.y] = Piece::King(*c);
            let o_moves = if *c == 0  {
                get_all_black_moves(&board_copy, false, false, castling_info, true)
            } else {
                get_all_white_moves(&board_copy, false, false, castling_info, true)
            };

            if o_moves.contains(a_move) {
                indices.push(j);
            }
        }
        indices.reverse();

        for i in indices {
            move_array.remove(i);
        }
     }

     // Castling
     let (checked, moves_through_check_r, moves_through_check_l, y) = if *c == 0 {
        let b_moves = get_all_black_moves(board, false, false, castling_info, false);

        let m_t_c_r = b_moves.contains(&Move { x: 5, y: 7 }) || b_moves.contains(&Move { x: 6, y: 7 });
        let m_t_c_l = b_moves.contains(&Move { x: 3, y: 7 }) || b_moves.contains(&Move { x: 2, y: 7 });

        (b_moves.contains(&Move { x: 4, y: 7 }), m_t_c_r, m_t_c_l, 7)
     } else {
        let w_moves = get_all_white_moves(board, false, false, castling_info, false);

        let m_t_c_r = w_moves.contains(&Move { x: 5, y: 0 }) || w_moves.contains(&Move { x: 6, y: 0 });
        let m_t_c_l = w_moves.contains(&Move { x: 3, y: 0 }) || w_moves.contains(&Move { x: 2, y: 0 });

        (w_moves.contains(&Move { x: 4, y: 0 }), m_t_c_r, m_t_c_l, 0)
     };

     if board[4][y] == Piece::King(*c) && !castling_info.king_moved(c) && !checked {
        if board[7][y] == Piece::Rook(*c) && board[5][y] == Piece::Empty && board[6][y] == Piece::Empty && !castling_info.h_rook_moved(c) && !moves_through_check_r {
            move_array.push(Move { x: 7, y});
        }
        if board[0][y] == Piece::Rook(*c) && board[1][y] == Piece::Empty && board[2][y] == Piece::Empty && board[3][y] == Piece::Empty && !castling_info.a_rook_moved(c) && !moves_through_check_l {
            move_array.push(Move { x: 0, y});
        }
     }
 }

 pub fn get_all_white_moves(board: &[[Piece; 8]; 8], include_pawn_front: bool, checks_pins: bool, castling_info: &CastlingInfo, check_king: bool) -> Vec<Move> {
    let mut move_array = Vec::<Move>::new();

    for i in 0..8 {
        for j in 0..8 {
            match board[i][j] {
                Piece::Pawn(0) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, &castling_info));
                }
                Piece::Rook(0) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, &castling_info));
                }
                Piece::Bishop(0) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, &castling_info));
                }
                Piece::Queen(0) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, &castling_info));
                }
                Piece::Knight(0) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, &castling_info));
                }
                Piece::King(0) => {
                    if check_king {
                        move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, &castling_info));
                    }
                }
                _ => ()
            }
        }
    }

    move_array
}

pub fn get_all_black_moves(board: &[[Piece; 8]; 8], include_pawn_front: bool, checks_pins: bool, castling_info: &CastlingInfo, check_king: bool) -> Vec<Move> {
    let mut move_array = Vec::<Move>::new();

    for i in 0..8 {
        for j in 0..8 {
            match board[i][j] {
                Piece::Pawn(1) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, castling_info));
                }
                Piece::Rook(1) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, castling_info));
                }
                Piece::Bishop(1) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, castling_info));
                }
                Piece::Queen(1) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, castling_info));
                }
                Piece::Knight(1) => {
                    move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, castling_info));
                }
                Piece::King(1) => {
                    if check_king {
                        move_array.append(&mut get_available_moves(board, i, j, false, include_pawn_front, checks_pins, castling_info));
                    }
                }
                _ => ()
            }
        }
    }

    move_array
}

 pub fn get_available_moves(board: &[[Piece; 8]; 8], x: usize, y: usize, check_unavailabe: bool, include_pawn_front: bool, checks_pins: bool, castling_info: &CastlingInfo) -> Vec<Move> {
    let mut move_array = Vec::<Move>::new();

    let mut color = 2;
    
    match &board[x][y] {
        Piece::Pawn(0) => {
            if y != 0 {
                if include_pawn_front {
                    if board[x][y - 1] == Piece::Empty {
                        move_array.push(Move { x, y: y - 1})
                    }
                    if y == 6 {
                        if board[x][y - 2] == Piece::Empty && board[x][y - 1] == Piece::Empty {
                            move_array.push(Move { x, y: y - 2})
                        }
                    }
                }
                if x != 0 {
                    if board[x - 1][y - 1].get_color() == 1 {
                        move_array.push(Move { x: x - 1, y: y - 1});
                    }
                }
                if x != 7 {
                    if board[x + 1][y - 1].get_color() == 1 {
                        move_array.push(Move { x: x + 1, y: y - 1});
                    }
                }
            }

            color = 0;
        },
        Piece::Pawn(1) => {
            if y != 7 {
                if include_pawn_front {
                    if board[x][y + 1] == Piece::Empty {
                        move_array.push(Move { x, y: y + 1})
                    }
                    if y == 1 {
                        if board[x][y + 2] == Piece::Empty && board[x][y + 1] == Piece::Empty {
                            move_array.push(Move { x, y: y + 2})
                        }
                    }
                }
                if x != 0 {
                    if board[x - 1][y + 1].get_color() == 0 {
                        move_array.push(Move { x: x - 1, y: y + 1});
                    }
                }
                if x != 7 {
                    if board[x + 1][y + 1].get_color() == 0 {
                        move_array.push(Move { x: x + 1, y: y + 1});
                    }
                }
            }

            color = 1;
        },
        Piece::Rook(c) => {
            rook_movement(board, x, y, c, &mut move_array);
            color = *c;
        }
        Piece::Bishop(c) => {
            bishop_movement(board, x, y, c, &mut move_array);
            color = *c;
        }
        Piece::Queen(c) => {
            rook_movement(board, x, y, c, &mut move_array);
            bishop_movement(board, x, y, c, &mut move_array);
            color = *c;
        }
        Piece::Knight(c) => {
            knigth_movement(board, x, y, c, &mut move_array);
            color = *c;
        }
        Piece::King(c) => {
            king_movement(board, x, y, c, &mut move_array, check_unavailabe, castling_info);
            color = *c;
        }
        _ => (),
    }

    // Remove all moves that result in check
    if checks_pins {
        if color != 0 && board[x][y] != Piece::King(1) {
            let mut indices = Vec::<usize>::new();

            for (i, a_move) in move_array.iter().enumerate() {
                let mut board_copy = board.clone();
                board_copy[x][y] = Piece::Empty;
                board_copy[a_move.x][a_move.y] = board[x][y];

                if is_black_king_checked(&board_copy, castling_info) {
                    indices.push(i);
                }
            }

            indices.reverse();
            for i in indices {
                move_array.remove(i);
            }
        }
        if color != 1 && board[x][y] != Piece::King(0) {
            let mut indices = Vec::<usize>::new();

            for (i, a_move) in move_array.iter().enumerate() {
                let mut board_copy = board.clone();
                board_copy[x][y] = Piece::Empty;
                board_copy[a_move.x][a_move.y] = board[x][y];

                if is_white_king_checked(&board_copy, castling_info) {
                    indices.push(i);
                }
            }

            indices.reverse();
            for i in indices {
                move_array.remove(i);
            }
        }
    }

    move_array
}

pub fn is_white_king_checked(board: &[[Piece; 8]; 8], castling_info: &CastlingInfo) -> bool {
    for i in 0..8 {
        for j in 0..8 {
            match board[i][j] {
                Piece::King(0) => {
                    let b_moves = get_all_black_moves(board, false, false, castling_info, true);
                    if b_moves.contains(&Move { x: i, y: j }) {
                        return true;
                    }
                },
                _ => (),
            }
        }
    }
    false
}

pub fn is_black_king_checked(board: &[[Piece; 8]; 8], castling_info: &CastlingInfo) -> bool {
    for i in 0..8 {
        for j in 0..8 {
            match board[i][j] {
                Piece::King(1) => {
                    let w_moves = get_all_white_moves(board, false, false, castling_info, true);
                    if w_moves.contains(&Move { x: i, y: j }) {
                        return true;
                    }
                },
                _ => (),
            }
        }
    }
    false
}