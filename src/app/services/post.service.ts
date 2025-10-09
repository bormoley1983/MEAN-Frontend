import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>('http://localhost:3000/api/posts')
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
            };
          });
        }),
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  // getPost(id: string): Post | null {
  //   const found = this.posts.find(p => p.id === id);
  //   return found ? {...found} : null
  // }

  getPost(id: string) {
    const result = this.http.get<{ message: string; post: Post }>(
      'http://localhost:3000/api/posts/' + id,
    );
    return result;
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title)
    this.http      
    .post<{
        message: string;
        post: Post;
      }>('http://localhost:3000/api/posts', postData)
      .subscribe((responseData) => {
        console.log(responseData.message);
        const post: Post = { 
          id: responseData.post.id, 
          title: responseData.post.title, 
          content: responseData.post.content,
          imagePath: responseData.post.imagePath
        }
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });

    // const post: Post = { id: null, title: title, content: content };
    // this.http
    //   .post<{
    //     message: string;
    //     postId: string;
    //   }>('http://localhost:3000/api/posts', post)
    //   .subscribe((responseData) => {
    //     console.log(responseData.message);
    //     post.id = responseData.postId;
    //     this.posts.push(post);
    //     this.postsUpdated.next([...this.posts]);
    //     this.router.navigate(['/']);
    //   });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
       postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
      }

    }

    this.http
      .put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe((response) => {
        console.log(response);
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex((p) => p.id == id);
        const post: Post = {
          id: id,
          title: title,
          content: content,
          imagePath: ''//response.imagePath
        }
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete('http://localhost:3000/api/posts/' + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        console.log('Deleted! PostId:' + postId);
      });
  }
}
