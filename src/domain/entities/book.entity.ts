export type CreateBookParams = Omit<ReconstructBookParams, 'id' | 'createdAt'>;

export type ReconstructBookParams = {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
};

export class Book {
  private constructor(private readonly _props: ReconstructBookParams) {}

  static create(params: CreateBookParams): Book {
    return new Book({
      id: '',
      title: params.title.trim(),
      author: params.author.trim(),
      createdAt: new Date()
    });
  }

  static reconstruct(params: ReconstructBookParams): Book {
    return new Book({
      id: params.id,
      title: params.title,
      author: params.author,
      createdAt: params.createdAt
    });
  }

  get id() {
    return this._props.id;
  }
  get title() {
    return this._props.title;
  }
  get author() {
    return this._props.author;
  }
  get createdAt() {
    return this._props.createdAt;
  }

  toJSON() {
    return {
      id: this._props.id,
      title: this._props.title,
      author: this._props.author,
      createdAt: this._props.createdAt.toISOString()
    };
  }
}

export type BookDto = ReturnType<Book['toJSON']>;
export type TBook = BookDto;
