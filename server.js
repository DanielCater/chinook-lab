const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./Chinook_Sqlite.sqlite");
const app = express();
app.use(express.json());
// Test route: list all tables in the database
app.get('/tables', (req, res) => {
    const stmt = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    res.json(stmt.all());
});

app.get('/artists', (req, res) => {
    const stmt = db.prepare(
        "SELECT * FROM Artist"
    );
    res.json(stmt.all());
});

app.get('/artists/:id/albums', (req, res) => {
    const id = parseInt(req.params.id);
    const stmt = db.prepare(
        "SELECT * FROM Album WHERE ArtistId = ?"
    );
    res.json(stmt.all(id));
});

app.get('/tracks/long', (req, res) => {
    const stmt = db.prepare(
        "SELECT Track.Name, Track.Milliseconds, Album.Title FROM Track JOIN Album ON Track.AlbumId = Album.AlbumId WHERE Track.Milliseconds > 300000"
    );
    res.json(stmt.all());
});

app.get('/genres/:id/stats', (req, res) => {
    const id = parseInt(req.params.id);
    const stmt = db.prepare(
        "SELECT Genre.Name, COUNT(Track.TrackId), AVG(Track.Milliseconds) FROM Genre JOIN Track ON Track.GenreId = Genre.GenreId WHERE Genre.GenreId = ?"
    );
    res.json(stmt.all(id));
});

app.post('/playlists', (req, res) => {
    const {name} = req.body;
    const stmt = db.prepare(
        "INSERT INTO Playlist (Name) VALUES (?)" 
    );
    const result = stmt.run(name);
    res.status(201).json({id: Number(result.lastInsertRowid), name: name});
});

app.delete('/playlists/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const stmt = db.prepare(
        "DELETE FROM Playlist WHERE PlaylistId = ?" 
    );
    const result = stmt.run(id);
    
    if (result === 0){
        return res.status(404).json({error: "Playlist not found"});
    }

    res.json({message: "Playlist deleted"});
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});