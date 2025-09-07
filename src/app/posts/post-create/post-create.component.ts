import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostsService } from 'src/app/services/post.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent {
  // Properties
  constructor(public postsService: PostsService) {}

  // Lifecycle hooks

  // Public methods
  onSavePost(form: NgForm) {
    console.log('onSavePost called');
    console.log('Form valid:', form.valid);
    console.log('Form value:', form.value);

    if (form.invalid) {
      return;
    }

    console.log('Emitting post');
    this.postsService.addPost(form.value.title, form.value.content);
    form.resetForm();
  }
  // Private methods
}
