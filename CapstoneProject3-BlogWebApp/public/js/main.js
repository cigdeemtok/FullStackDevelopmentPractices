$(document).ready(() => {
  // Handling delete button clicks
  $(".delete-btn").on("click", function () {
    const postId = $(this).data("post-id");

    if (confirm("Are you sure you want to delete this post?")) {
        fetch(`/deletePost/${postId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            // if deleted successfully show alert and reload the page
            alert("Post deleted successfully.");
            window.location.reload();
          } else {
            alert("Failed to delete the post.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while trying to delete the post.");
        });
    }
  });
  // Handling edit button clicks
  //Handling modal with js instead of default bootstrap for preventing not getting post info correctly
  const editModal = document.getElementById("editModal");
  const bootstrapModal = editModal ? new bootstrap.Modal(editModal) : null; 
  
  //putting selected form info to modal
  $(".edit-btn").on("click", function(){ 

    const postId = $(this).data("post-id");

    if(postId === undefined || postId === null){
      console.error("Couldn't find the post. Can not edit!");
      return;
    }

    $("#editPostId").val(postId);

    fetch(`/posts/${postId}`)
      .then(response => {
        if(!response.ok){
          throw new Error("Couldn't get the post. Error code: " + response.status);
        }
        return response.json();
      })
      .then(postData => {
        $("#editImageUrl").val(postData.imageUrl);
        $("#editAuthor").val(postData.author);
        $("#editTitle").val(postData.title);
        $("#editDesc").val(postData.desc);
        $("#editContent").val(postData.postContent);

        //open the modal after getting data
        if(bootstrapModal){
          bootstrapModal.show();
        }
      })
      .catch(error => {
        console.error("Can not get post details: ",error);
        alert("Can't open this post to edit.");
      })
  });

  // Handling editing and updating post
  $("#editForm").on("submit",function(e){
    e.preventDefault();

    const postId = $("#editPostId").val();

    const updatedPost = {
      imageUrl : $("#editImageUrl").val(),
      author : $("#editAuthor").val(),
      title : $("#editTitle").val(),
      desc : $("#editDesc").val(),
      postContent : $("#editContent").val()
    }

    fetch(`/posts/${postId}`,{
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(updatedPost)
    })
    .then(response => {
      if(response.ok){
        alert("Post updated successfully!");
        if(bootstrapModal){
          bootstrapModal.hide();
        }
        window.location.reload();
      }else{
        alert("Update failed!");
      }
    })
    .catch(error => console.error("Hata:",error));

  });

});


