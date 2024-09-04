import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a User Model has
// so that we can use the build method to create a new User instance with type checking
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // Customize the JSON representation of the user document to remove the password and the version field
    // and unify the id field to match the id field in the frontend app and other potential databases
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;        
      },
    },
  }
);

// Mongoose middleware to hash the password before saving it to the database,
// we use a function instead of an arrow function because we need to use the this keyword
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// Mongoose middleware to hash the password before saving it to the database
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
