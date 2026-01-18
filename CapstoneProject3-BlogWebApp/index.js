import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let blogPosts = [
  {
    id: 0,
    title: "7 Tips To Write Clean And Better Code in 2025",
    author:
      "https://www.geeksforgeeks.org/blogs/tips-to-write-clean-and-better-code/",
    imageUrl:
      "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20191216192618/7-Tips-To-Write-Clean-And-Better-Code-in-2020.png",
    desc: "Software engineering is not just all about learning a language and building some software. As a software engineer or software developer, you are expected to write good software. So the question is what makes good software?",
    postContent:
      'Software engineering is not just all about learning a language and building some software. As a software engineer or software developer, you are expected to write good software. So the question is what makes good software? Good software can be judged by reading some pieces of code written in the project. If the code is easy to understand and easy to change then definitely it\'s a good software and developers love to work on that.It is a common thing in development that nobody wants to continue a project with horrible or messy code (It becomes a nightmare sometimes...). Sometimes developers avoid writing clean code due to deadline pressure. They rush to go faster but what happens actually is they end up going slower. It creates more bugs which they need to fix later going back on the same piece of code. This process takes much more time than the amount of time spent on writing the code. A study has revealed that the ratio of time spent reading code versus writing is well over 10 to 1. It doesn not matter if you are a beginner or an experienced programmer, you should always try to become a good programmer (not just a programmer...). Remember that you are responsible for the quality of your code so make your program good enough so that other developers can understand and they don\'t mock you every time to understand the messy code you wrote in your project. Before we discuss the art of writing clean and better code let\'s see some characteristics of it...What Makes a Code " a Clean Code " ?Clean code should be readable. If someone is reading your code they should have a feeling of reading poetry or prose.Clean code should be elegant. It should be pleasing to read and it should make you smile.Clean code should be simple and easy to understand. It should follow the single responsibility principle (SRP).Clean code should be easy to understand, easy to change, and easy to take care of.Clean code should run all the tests."Clean code is simple and direct. Clean code reads like a well-written prose. Clean code never obscures the designer intent but rather is full of crisp abstractions and straightforward lines of control." -Grady Booch (Author of Object-Oriented Analysis and Design with Applications) Conclusion For the purpose of creating high-quality software that is ultimately simple to maintain, test, and update, cleaner and better code must be written. In a Project different developers have to add multiple features on a shared project, so it become important for a developer to write , more clean and redable code that can be easily understandable by its naming convention itself. Developers can produce software that is reliable, scalable, and simple to use by adhering to the 7 recommended practices listed above and writing the code in a clear, organized, legible, and efficient manner.',
  },
  {
    id: 1,
    title: "What is Express.js?",
    author: "Wikipedia",
    imageUrl:
      "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fzojuy79lo3fn3qdt7g6p.png",
    desc: "Express.js, or simply Express, is a back end web application framework for building RESTful APIs with Node.js, released as free and open-source software under the MIT License.",
    postContent:
      "Express.js, or simply Express, is a back end web application framework for building RESTful APIs with Node.js, released as free and open-source software under the MIT License. It is designed for building web applications and APIs. It has been called the de facto standard server framework for Node.js.The original author, TJ Holowaychuk, described it as a Sinatra-inspired server, meaning that it is relatively minimal with many features available as plugins. Express is the back-end component of popular development stacks like the MEAN, MERN or MEVN stack, together with the MongoDB database software and a JavaScript front-end framework or library.",
  },
];
//home page
app.get("/", (req, res) => {
  res.render("index.ejs", {
    posts: blogPosts,
    toSlug: toSlug,
  });
});
//get details of selected post using id
//converts post titles into URL-safe strings, creating clean URLs
app.get("/details/:id/:slug", (req, res) => {
  const postId = parseInt(req.params.id);
  const postSlug = req.params.slug;

  const selectedPost = blogPosts.find((post) => post.id === postId);

  if (selectedPost) {
    const realSlug = toSlug(selectedPost.title);

    if (postSlug !== realSlug) {
      console.log("Redirecting to correct slug...");
      return res.redirect("/details/${selectedPost.id}/${realSlug}");
    }
    res.render("postDetails.ejs", { post: selectedPost });
  } else {
    res.status(404).send("Post not found");
  }
});
//create post get and post routes
app.get("/createPost", (req, res) => {
  res.render("createPost.ejs");
});
app.post("/createPost", (req, res) => {

const newPost = {
    id: generateId(),
    title: req.body["postTitle"],
    author: req.body["postAuthor"],
    imageUrl: req.body["postImageUrl"],
    desc: req.body["postDesc"],
    postContent: req.body["postContent"],
  };
  blogPosts.push(newPost);
  res.render("createPost.ejs", { success: true , error: false});
});
//deleting the selected post with id
app.delete("/deletePost/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  blogPosts = blogPosts.filter((post) => post.id !== postId);
  res.status(200).send("Post deleted successfully");
});
//showing modal with post info
app.get("/posts/:id", (req,res)=>{
  const postId = parseInt(req.params.id);
  const postToEdit = blogPosts.find(post => post.id === postId);

  if(postToEdit){
    res.json(postToEdit);
  }else{
    res.status(404).send({message : "Couldn't find the post!"});
  }
});
//updating post
app.put("/posts/:id", (req,res)=>{
  const postId = parseInt(req.params.id);

  const {imageUrl,author,title,desc,postContent} = req.body;

  const postToUpdate = blogPosts.find(post=> post.id === postId);

  if(postToUpdate){
    postToUpdate.imageUrl = imageUrl;
    postToUpdate.author = author;
    postToUpdate.title = title;
    postToUpdate.desc = desc;
    postToUpdate.postContent = postContent;

    res.status(200).send({message: "Post updates successfully!"});
  }else{
    res.status(404).send({message: "Couldn't find the post!"});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const toSlug = (title) => {
  return title
    .toString()
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

function generateId() {
  // if no posts id is 0
  if (blogPosts.length === 0) {
    return 0;
  }
  // if not empty return max existing id + 1
  const maxId = Math.max(...blogPosts.map((post) => post.id));
  return maxId + 1;
}