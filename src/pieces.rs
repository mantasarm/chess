#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Piece {
    Empty, Pawn(u8), Knight(u8), Queen(u8), Bishop(u8), Rook(u8), King(u8)
}

impl Piece {
    pub fn get_color(self) -> u8 {
        match self {
            Piece::Empty => 2,
            Piece::Pawn(c) => c,
            Piece::Knight(c) => c,
            Piece::Queen(c) => c,
            Piece::Bishop(c) => c,
            Piece::Rook(c) => c,
            Piece::King(c) => c,
        }
    }
}