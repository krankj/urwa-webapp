const mongoose = require("../services/mongoose.service").mongoose;
const MemberDetailsModel = require("./memberDetails.model");

let { Schema } = mongoose;
const opts = {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.password;
      delete ret.permissionLevel;
      delete ret.revokeAccess;
    },
  },
};

let memberSchema = new Schema(
  {
    siteNumber: { type: Number, unique: true, required: true },
    firstName: { type: String, unique: false, required: true },
    lastName: { type: String, unique: false, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, unique: false, required: true },
    permissionLevel: { type: Number, unique: false, required: true },
    revokeAccess: { type: Boolean, unique: false, required: true },
  },
  opts
);

let Member = mongoose.model("Member", memberSchema);

exports.insert = (memberData) => {
  let member = new Member(memberData);
  return member.save().then((result) => {
    memberData.details.memberId = result._id;
    return MemberDetailsModel.insert(memberData.details).then(() => result._id);
  });
};

exports.delete = (memberId) => {
  return new Promise((resolve, reject) => {
    Member.deleteMany({ _id: memberId }).exec((err, deletedMember) => {
      if (err) reject(err);
      MemberDetailsModel.delete(memberId)
        .then((deletedMemberDetails) =>
          resolve({ deletedMember, deletedMemberDetails })
        )
        .catch((err) => reject(err));
    });
  });
};