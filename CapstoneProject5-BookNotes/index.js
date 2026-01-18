import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import axios from "axios";

const app = express();
const PORT = 3000;
// Since getting book covers we just need URL and don't need to use axios
// I used open library's search by ISBN API for practicing API's
const isbnSearchBaseURL ="https://openlibrary.org/api/volumes/brief/isbn/";
env.config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

async function getAllBooks(){
    const result = await db.query("SELECT * FROM books_read ORDER BY date_read DESC");
    return result.rows;
}
//check if book already exist 
async function checkBooks(isbn){
    const result = await db.query("SELECT * FROM books_read WHERE isbn = $1",[isbn]);
    let bookExist = false;
    if(result.rows.length > 0){
        bookExist = true;
        return bookExist;
    }else{
        return bookExist;
    }

}
//get all books from db
app.get("/", async (req,res)=>{
    let booksRead = await getAllBooks();
    const status = req.query.status;
    res.render("index.ejs",{books : booksRead, status: status});
});

//get details by id from db in details route 
app.get("/details/:id", async (req,res)=>{
    const bookID = parseInt(req.params.id);
    const status = req.query.status;
    try {
        const result = await db.query("SELECT * FROM books_read WHERE id = $1",[bookID]);
        const selectedBook = result.rows[0];
        res.render("details.ejs",{book : selectedBook,status:status});
    } catch (err) {
        console.error("Error getting book details: ",err);
        res.render("detail.ejs",{error: err});
    }

});

// add books both by isbn and via form  
app.get("/addBook", (req,res)=>{
    res.render("createNewBook.ejs");
});

app.get("/searchByIsbn", (req,res)=>{ 
    res.render("searchByIsbn.ejs");
});

//edit existing book
app.get("/editBook/:id", async (req,res)=>{
    const bookID = parseInt(req.params.id); 
    try {
        const result = await db.query("SELECT * FROM books_read WHERE id = $1",[bookID]);
        const editedBook = result.rows[0];

        //fill form of to be edited book's info to form
        res.render("createNewBook.ejs",{book: editedBook});
    } catch (err) {
        console.error(err.message);
        res.render("createNewBook.ejs",{editError : err.message});
        
    }
});

app.post("/addBook", async (req,res)=>{
    const newBook = req.body;
    const checkBook = await checkBooks(req.body.isbn);

    if(!checkBook){
        try {
            await db.query(
                "INSERT INTO books_read (title,author,isbn,rating,description,notes,date_read) VALUES($1,$2,$3,$4,$5,$6,$7)",
                [newBook.title,newBook.author,newBook.isbn,newBook.rating,newBook.description,newBook.notes,newBook.date_read]);
            res.redirect("/");
        } catch (err) {
            console.error(err);
            //fix here both isbn and create
            res.redirect("/?status=add");
        }
    }else{
        res.redirect("/?status=exist");
    }
});


//handle edited data
app.post("/editBook/:id", async (req,res)=>{
    const bookID = parseInt(req.params.id);
    const editBook = req.body;

    try {
        const updatedBook = await db.query("UPDATE books_read SET title = $1, author = $2, isbn = $3, rating = $4, date_read = $5, description = $6, notes = $7 WHERE id = $8 RETURNING *",
        [editBook.title, editBook.author, editBook.isbn, editBook.rating, editBook.date_read, editBook.description, editBook.notes, bookID]);
        res.redirect(`/details/${bookID}?status=editSuccess`);
    } catch (err) {
        console.error("Can not edit this book : ",err);
        res.redirect(`/details/${bookID}?status=editError`);
    }
});

//get to be added book with ISBN number using open library API
app.post("/searchByIsbn", async (req,res)=>{
    const isbnNum = req.body.isbn;
    const isbnURL = isbnSearchBaseURL + isbnNum + ".json";

    try {
        const response = await axios.get(isbnURL);
      
        if(response){
            const data = Object.values(response.data.records)[0];
            const bookData = data.data;
            const details = data.details.details;
            let desc = "No description available.";
            
            if(details.description){
                desc = typeof details.description === "string" ? details.description : details.description.value;
            }

            const foundBook = {
                title: bookData.title,
                author: bookData.authors ? bookData.authors[0].name : "Unknown",
                isbn: isbnNum,
                description: desc
            };
            res.render("searchByIsbn.ejs",{book : foundBook});
        }else{
            res.render("searchByIsbn.ejs",{error : "Book not found in Open Library database."});
        }
    } catch (err) {
        console.error("API error: ",err);
        res.render("searchByIsbn.ejs",{error: `${err}. Check your ISBN input and try again.`});
    }
});
// delete book 
app.post("/delete/:id", async (req,res)=>{
    const bookID = parseInt(req.params.id);

    try {
        await db.query("DELETE FROM books_read WHERE id = $1",[bookID]);
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting the book: ",err);
        res.redirect(`/details/${bookID}?status=error`);
    }
});
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});