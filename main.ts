import express from "express";
import { user, post, comment, upvote_post as upvote_posts, upvote_comment as upvote_comments, following, upvote_comment } from "./data types";
import fs from "fs";
import { json } from "stream/consumers";
import { postresponse, requestpost,postPost } from "./Requests/postrquest";
import { Console } from "console";
import { Agent } from "http";
import { commentresponse, requestcomment, postComment} from "./Requests/commentsrequest";
import { replaysresponse, requestReplay} from "./Requests/replaysRequest";
import { userResponse, requestUser,postUser } from "./Requests/userRequest";
import { requestfollowing,postfollowing} from "./Requests/followingRequest";
const app = express();

const users: user[] = JSON.parse(
  fs.readFileSync("./database/users.json", "utf-8")
);
const posts: post[] = JSON.parse(
  fs.readFileSync("./database/posts.json", "utf-8")
);
const comments: comment[] = JSON.parse(
  fs.readFileSync("./database/comments.json", "utf-8")
);
const upvote_posts: upvote_posts[] = JSON.parse(
  fs.readFileSync("./database/upvote_post.json", "utf-8")
);
const upvote_comments: upvote_comments[] = JSON.parse(
  fs.readFileSync("./database/upvote_comment.json", "utf-8")
);

const following:following[] = JSON.parse(
  fs.readFileSync("./database/following.json", "utf-8")
);
//users
//-------------------------------------------------------------

//get users or specific user
app.get("/reddit/users", (req: requestUser, res) => {
    let result: userResponse[] = [];
    users.forEach((u) => {
        result.push({
            username: u.username,
            _id: u._id,
            age: u.age,
            follwers: following.filter((f) => f.following_id === u._id).length,
            following: following.filter((f) => f.follower_id === u._id).length
        });
    });
    if(Object.entries(req.query).length !== 0)
    {
        if(req.query._id)
        {
            result=result.filter((u)=>u._id===parseInt(req.query._id));
        }
        else if(req.query.username)
        {
            result=result.filter((u)=>u.username===req.query.username);
        }
        res.send(result);
    }
    else
    {
        res.send(result);
    }
});

//---------------------------------------------
//add user
app.post("/reddit/users", express.json(), (req: postUser, res) => {
    if(users.find((u)=>u.username===req.body.username))
    {
        return res.status(409).json({message:"user already exists"});       
    }
    let newUser:user={
        _id: (new Date()).getTime(),
        username: req.body.username,
        age: req.body.age,
        password: req.body.password
    }
    users.push(newUser);
    fs.writeFileSync("./database/users.json", JSON.stringify(users, null, 2));
    res.status(201).json(users);
});


//---------------------------------------------
//update user
app.put("/reddit/users/:id", express.json(), (req: express.Request<{id:string},user|{message:string},{password:string,username:string,age:number},{}>, res) => {
    if(users.find((u)=>u.username===req.body.username))
        {
            return res.status(409).json({message:"user already exists"});       
        }
    let id = parseInt(req.params.id);
    let old_user = users.find((u)=>u._id===id);
    if(old_user)
    {
        old_user._id=id;
        old_user.password=req.body.password;
        old_user.username=req.body.username;
        old_user.age=req.body.age;
        fs.writeFileSync("./database/users.json", JSON.stringify(users, null, 2));
        res.status(200).json(old_user);
    }
    else
    {
        res.status(404).json({ message: "user not found" });
    }
})


//---------------------------------------------
//delete user
app.delete("/reddit/users/:id", (req:express.Request<{id:string},user|{message:string},{},{}>, res) => {
    let id = parseInt(req.params.id);
    let index = users.findIndex((u)=>u._id===id);
    if(index!==-1)
    {
        let [deletedUser]= users.splice(index, 1);
        fs.writeFileSync("./database/users.json", JSON.stringify(users, null, 2));
        res.status(200).json(deletedUser);
    }
    else
    {
        res.status(404).json({ message: "user not found" });
    }
});


//-------------------------------------------------------------
//post following requests
app.post("/reddit/following", express.json(), (req:postfollowing, res) => {
    if((following.find((f)=>f.follower_id===req.body.follower && f.following_id===req.body.following)))
    {
        console.log("already following");
        return res.status(409).json({message:"already following"});
    }
    let newfollow :following ={
        date: new Date(),
        follower_id: req.body.follower,
        following_id: req.body.following
    }
    following.push(newfollow);
    fs.writeFileSync("./database/following.json", JSON.stringify(following, null, 2));
    res.status(201).json(newfollow);
});
//-------------------------------------------------------------
//get following
app.get("/reddit/following", (req:requestfollowing,res) => {
    if(Object.entries(req.query).length!==0)
    {
        if(req.query.follower&&!req.query.following)
        {
            let result = following.filter((f)=>f.follower_id===parseInt(req.query.follower));
            res.send(result);
        }
        else if(!req.query.follower&&req.query.following)
        {
            let result = following.filter((f)=>f.following_id===parseInt(req.query.following));
            res.send(result);
        }
        else if(req.query.following&&req.query.follower)
        {
            let result = following.filter((f)=>f.follower_id===parseInt(req.query.follower) && f.following_id===parseInt(req.query.following));
            res.send(result);
        }
    }
    res.send(following);
});

//-------------------------------------------------------------
//delete following
app.delete("/reddit/following", express.json(), (req:express.Request<{},following|{message:string},{follower:number,following:number},{}>, res) => {
    let index = following.findIndex((f)=>f.follower_id===req.body.follower && f.following_id===req.body.following);
    if(index!==-1)
    {
        let [deletedFollowing]= following.splice(index, 1);
        fs.writeFileSync("./database/following.json", JSON.stringify(following, null, 2));
        res.status(200).json(deletedFollowing);
    }
    else
    {
        res.status(404).json({ message: "following not found" });
    }
});
//-------------------------------------------------------------
//get posts for a user
app.get("/reddit/posts", (req: requestpost, res) => {
  let result: postresponse[] = [];
  posts.forEach((p) => {
    let userData = users.find((u) => u._id === p.user_id);
    if (userData) {
      result.push({
        user: {
          username: userData.username,
          _id: userData._id,
          age: userData.age,
        },
        _id: p._id,
        content: p.content,
        image_content: p.image_content,
        created_at: p.created_at,
        upvotes: upvote_posts.filter((up) => up.post_id === p._id).length,
      });
    }
  });
  if (Object.entries(req.query).length !== 0) {
    if (req.query._id) {
      let id = parseInt(req.query._id);
      result = result.filter((p) => p.user._id === id);
    }
    if (req.query.search) {
      result = result.filter((p) => p.content.includes(req.query.search));
    }
    res.send(result);
  } else {
    res.send(result);
  }
});


//---------------------------------------------
//get comments for a post
app.get("/reddit/comments", (req: requestcomment, res) => {
  let result: commentresponse[] = [];
  comments.forEach((c) => {
    let userData = users.find((u) => u._id === c.user_id);
    if (userData && c.parent_id === null) {
      result.push({
        user: {
          username: userData.username,
          _id: userData._id,
          age: userData.age,
        },
        _id: c._id,
        post_id: c.post_id,
        content: c.content,
        created_at: c.created_at,
        upvaotes: upvote_comments.filter((up) => up.comment_id === c._id).length,
      });
    }
  });
  if (Object.entries(req.query).length !== 0) {
    if (req.query.post_id) {
      result = result.filter((c) => c.post_id === parseInt(req.query.post_id));
    }
    res.send(result);
  } else {
    res.send(result);
  }
});

//---------------------------------------------
//get replays for a comment
app.get("/reddit/replays", (req: requestReplay, res) => {
  let result: replaysresponse[] = [];
  comments.forEach((c) => {
    let userData = users.find((u) => u._id === c.user_id);
    if (userData && c.parent_id !== null) {
      result.push({
        user: {
          username: userData.username,
          _id: userData._id,
          age: userData.age,
        },
        _id: c._id,
        post_id: c.post_id,
        content: c.content,
        created_at: c.created_at,
        parent_id: c.parent_id,
        upvotes: upvote_comments.filter((up) => up.comment_id === c._id).length,
      });
    }
  });
  if (Object.entries(req.query).length !== 0) {
    if (req.query.comment_id) {
      result = result.filter(
        (c) => c.parent_id === parseInt(req.query.comment_id)
      );
    }
    res.send(result);
  } else {
    res.send(result);
  }
});

//---------------------------------------
//create new post
app.post("/reddit/posts", express.json(), (req:postPost, res) => {
  
  let newPost: post = {
    _id: (new Date()).getTime(),
    user_id: req.body.user_id,
    content: req.body.content,
    image_content: req.body.image_content,
    created_at: new Date(),
  };
  posts.push(newPost);
  fs.writeFileSync("./database/posts.json", JSON.stringify(posts, null, 2));
  res.status(201).json(posts);
});

//update comment or repaly
app.patch("/reddit/comments/:id", express.json(), (req:express.Request<{id:string},comment|{message:string},{newContent:string},{}>, res) => {
  let id = parseInt(req.params.id);
  let oldcomment:comment|undefined= comments.find((comment) => comment._id === id);
  if (oldcomment) 
  {
    oldcomment.content=req.body.newContent;
    fs.writeFileSync("./database/comments.json", JSON.stringify(comments, null, 2));
    res.status(200).json(oldcomment);
  }
  else
  {
    res.status(404).json({ message: "comment not found" });
  }
});

//--------------------------------
//delete comment or replay 
app.delete("/reddit/comments/:id", (req:express.Request<{id:string},{message:string}|comment,{},{}>, res) => {
  let id = parseInt(req.params.id);
  let index = comments.findIndex((comments) => comments._id === id);
  if(index!==-1)
  {
     let [deletedComment]=comments.splice(index, 1);
     fs.writeFileSync("./database/comments.json", JSON.stringify(comments, null, 2));
     res.status(200).json(deletedComment);
  }
  else
  {
    res.status(404).json({ message: "comment not found" });
  }
});

//--------------------------------
//create new comment
app.post("/reddit/comments", express.json(), (req: postComment, res) => {
    let newComment: comment = {
      _id: (new Date()).getTime(),
      user_id: req.body.user_id,
      post_id: req.body.post_id,
      content: req.body.content,
      created_at: new Date(),
      parent_id: req.body.parent_id,
    };
    comments.push(newComment);
    fs.writeFileSync("./database/comments.json", JSON.stringify(comments, null, 2));
    res.status(201).json(newComment);
});

//--------------------------------
//update post
app.put("/reddit/posts/:id", express.json(), (req, res) => {
  let id = parseInt(req.params.id);
  let oldpost: post | undefined = posts.find((post) => post._id === id);
  if (!oldpost) {
    res.status(404).json({ message: "post not found" });
  } else {
    req.body = req.body as post;
    oldpost.content = req.body.content;
    oldpost.image_content = req.body.image_content;
    fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
    res.status(200).json(oldpost);
  }
});


//--------------------------------
//delete post
app.delete("/reddit/posts/:id", (req, res) => {
  let id = parseInt(req.params.id);
  let index = posts.findIndex((posts) => posts._id === id);
  if (index === -1) {
    res.status(404).json({ message: "post not found" });
  } else {
    let arr: post[] = posts.splice(index, 1);
    fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
    res.status(200).json(arr);
  }
});


//--------------------------------
//post upvote_post
app.post("/reddit/upvote_posts", express.json(), (req:express.Request<{},upvote_posts,{post_id:number,user_id:number}>, res) => {

    let newUpvote: upvote_posts = {
        user_id: req.body.user_id,
        post_id: req.body.post_id,
        created_at: new Date(),
    };
    upvote_posts.push(newUpvote);
    fs.writeFileSync("./database/upvote_post.json", JSON.stringify(upvote_posts, null, 2));
    res.status(201).json(newUpvote);
    });

//--------------------------------
//delete upvote_post
app.delete("/reddit/upvote_posts", express.json(),(req:express.Request<{},upvote_posts|{message:string},{post_id:number,user_id:number},{}>, res) => {
    let index = upvote_posts.findIndex((u)=>u.post_id===req.body.post_id && u.user_id===req.body.user_id);
    if(index!==-1)
    {
        let [deletedUpvote]=upvote_posts.splice(index, 1);
        fs.writeFileSync("./database/upvote_post.json", JSON.stringify(upvote_posts, null, 2));
        res.status(200).json(deletedUpvote);
    }
    else
    {
        res.status(404).json({ message: "upvote_post not found" });
    }
});

//--------------------------------
//post upvote_comment
app.post("/reddit/upvote_comments", express.json(), (req:express.Request<{},upvote_comments,{comment_id:number,user_id:number}>, res) => {

    let newUpvote: upvote_comments = {
        user_id: req.body.user_id,
        comment_id: req.body.comment_id,
        created_at: new Date(),
    };
    upvote_comments.push(newUpvote);
    fs.writeFileSync("./database/upvote_comment.json", JSON.stringify(upvote_comments, null, 2));
    res.status(201).json(newUpvote);
    });

//--------------------------------
//delete upvote_comment
app.delete("/reddit/upvote_comments", express.json(),(req:express.Request<{},upvote_comments|{message:string},{user_id:number,comment_id:number},{}>, res) => {
    let index = upvote_comments.findIndex((u:upvote_comment)=>u.comment_id===req.body.comment_id&&u.user_id===req.body.user_id);
    if(index!==-1)
    {
        let [deletedUpvote]=upvote_comments.splice(index, 1);
        fs.writeFileSync("./database/upvote_comment.json", JSON.stringify(upvote_comments, null, 2));
        res.status(200).json(deletedUpvote);
    }
    else
    {
        res.status(404).json({ message: "upvote_comments not found" });
    }
});




app.listen(3000, () => {
  console.log("Server started on port 3000");
});
