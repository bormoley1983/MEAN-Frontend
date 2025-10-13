import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostsService } from 'src/app/services/post.service';
import { Post } from '../../models/post.model';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
  standalone: false,
})
export class PostCreateComponent implements OnInit {
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}
  public mode = 'create';
  private postId: string = '';
  post: Post = { id: null, title: '', content: '', imagePath: '' };
  isLoading = false;
  form: FormGroup = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    content: new FormControl('', { validators: [Validators.required] }),
    image: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [mimeType],
    }),
  });
  imagePreview: string = '';

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = paramMap.get('postId');
      if (paramMap.has('postId') && typeof id === 'string') {
        this.mode = 'edit';
        this.postId = id;
        this.isLoading = true;
        // setTimeout(() => {
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.post = {
            id: postData.post.id,
            title: postData.post.title,
            content: postData.post.content,
            imagePath: postData.post.imagePath,
          };
          this.form = new FormGroup({
            title: new FormControl(this.post.title, {
              validators: [Validators.required, Validators.minLength(3)],
            }),
            content: new FormControl(this.post.content, {
              validators: [Validators.required],
            }),
            image: new FormControl(this.post.imagePath),
          });
          this.imagePreview = this.post.imagePath;
          this.isLoading = false;
        });
        // }, 5000);
      } else {
        this.mode = 'create';
        this.post = { id: null, title: '', content: '', imagePath: '' };
        this.postId = '';

        this.form = new FormGroup({
          title: new FormControl('', {
            validators: [Validators.required, Validators.minLength(3)],
          }),
          content: new FormControl('', { validators: [Validators.required] }),
          image: new FormControl('', {
            validators: [Validators.required],
            asyncValidators: [mimeType],
          }),
        });
      }
    });
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else if (this.postId) {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}
