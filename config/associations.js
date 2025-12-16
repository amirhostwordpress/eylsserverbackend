// Define all model associations here
import User from "../models/user.model.js";
import Case from "../models/case.model.js";
import CaseTracking from "../models/caseTracking.model.js";
import CaseExpense from "../models/caseExpense.model.js";
import Document from "../models/document.model.js";
import Consultation from "../models/consultation.model.js";
import Payment from "../models/payment.model.js";
import Notification from "../models/notification.model.js";
import Setting from "../models/setting.model.js";
import Subscription from "../models/subscription.model.js";
import CaseType from "../models/caseType.model.js";
import CaseCategory from "../models/caseCategory.model.js";
import CaseSubCategory from "../models/caseSubCategory.model.js";
import WorkOccupationType from "../models/workOccupationType.model.js";
import WorkOccupationSubType from "../models/workOccupationSubType.model.js";
import PoliceStation from "../models/policeStation.model.js";
import Jail from "../models/jail.model.js";
import JailVisit from "../models/jailVisit.model.js";
import CourtQuotation from "../models/courtQuotation.model.js";
import PasswordReset from "../models/passwordReset.model.js";
import CaseInquiry from "../models/caseInquiry.model.js";
import Message from "../models/message.model.js";

const setupAssociations = () => {
  // User associations
  User.hasMany(Case, { as: "clientCases", foreignKey: "clientId", constraints: false });
  User.hasMany(Case, { as: "coordinatorCases", foreignKey: "coordinatorId", constraints: false });
  User.hasMany(Case, { as: "counsellorCases", foreignKey: "counsellorId", constraints: false });
  User.hasMany(Case, { as: "lawyerCases", foreignKey: "lawyerId", constraints: false });
  User.hasMany(User, { as: "createdUsers", foreignKey: "createdBy" });
  User.belongsTo(User, { as: "creator", foreignKey: "createdBy" });

  // Case associations
  Case.belongsTo(User, { as: "client", foreignKey: "clientId", constraints: false });
  Case.belongsTo(User, { as: "coordinator", foreignKey: "coordinatorId", constraints: false });
  Case.belongsTo(User, { as: "counsellor", foreignKey: "counsellorId", constraints: false });
  Case.belongsTo(User, { as: "lawyer", foreignKey: "lawyerId", constraints: false });
  Case.hasMany(CaseTracking, { as: "trackingRecords", foreignKey: "caseId" });
  Case.hasMany(CaseExpense, { as: "expenses", foreignKey: "caseId" });
  Case.hasMany(Document, { as: "documents", foreignKey: "caseId" });
  Case.hasMany(Payment, { as: "payments", foreignKey: "caseId" });
  Case.hasOne(Consultation, { as: "consultation", foreignKey: "caseId" });

  // CaseTracking associations
  CaseTracking.belongsTo(Case, { as: "case", foreignKey: "caseId" });
  CaseTracking.belongsTo(User, { as: "user", foreignKey: "userId" });

  // CaseExpense associations
  CaseExpense.belongsTo(Case, { as: "case", foreignKey: "caseId" });

  // Document associations
  Document.belongsTo(Case, { as: "case", foreignKey: "caseId" });
  Document.belongsTo(User, { as: "uploader", foreignKey: "uploadedBy" });

  // Consultation associations
  Consultation.belongsTo(User, { as: "client", foreignKey: "clientId" });
  Consultation.belongsTo(User, { as: "counsellor", foreignKey: "counsellorId" });
  Consultation.belongsTo(User, { as: "lawyer", foreignKey: "lawyerId" });
  Consultation.belongsTo(Case, { as: "case", foreignKey: "caseId" });
  Consultation.hasOne(Payment, { as: "payment", foreignKey: "consultationId" });

  // Payment associations
  Payment.belongsTo(Case, { as: "case", foreignKey: "caseId" });
  Payment.belongsTo(User, { as: "client", foreignKey: "clientId" });
  Payment.belongsTo(Consultation, {
    as: "consultation",
    foreignKey: "consultationId",
  });

  // Notification associations
  Notification.belongsTo(User, { as: "user", foreignKey: "userId" });

  // Setting associations
  Setting.belongsTo(User, { as: "updater", foreignKey: "updatedBy" });

  // Case Type associations
  CaseType.belongsTo(User, { as: "creator", foreignKey: "createdBy" });
  CaseType.hasMany(CaseCategory, { as: "categories", foreignKey: "caseTypeId", onDelete: "CASCADE" });

  // Case Category associations
  CaseCategory.belongsTo(CaseType, { as: "caseType", foreignKey: "caseTypeId" });
  CaseCategory.hasMany(CaseSubCategory, { as: "subCategories", foreignKey: "categoryId", onDelete: "CASCADE" });

  // Case Sub-Category associations
  CaseSubCategory.belongsTo(CaseCategory, { as: "category", foreignKey: "categoryId" });

  // Work Occupation Type associations
  WorkOccupationType.belongsTo(User, { as: "creator", foreignKey: "createdBy" });
  WorkOccupationType.hasMany(WorkOccupationSubType, { as: "subTypes", foreignKey: "occupationTypeId", onDelete: "CASCADE" });

  // Work Occupation Sub-Type associations
  WorkOccupationSubType.belongsTo(WorkOccupationType, { as: "occupationType", foreignKey: "occupationTypeId" });

  // Police Station associations
  PoliceStation.belongsTo(User, { as: "creator", foreignKey: "createdBy" });
  PoliceStation.hasMany(Jail, { as: "jails", foreignKey: "policeStationId", onDelete: "CASCADE" });

  // Jail associations
  Jail.belongsTo(PoliceStation, { as: "policeStation", foreignKey: "policeStationId" });
  Jail.belongsTo(User, { as: "creator", foreignKey: "createdBy" });
  Jail.hasMany(JailVisit, { as: "visits", foreignKey: "jailId" });

  // Jail Visit associations
  JailVisit.belongsTo(Case, { as: "case", foreignKey: "caseNumber", targetKey: "caseNumber" });
  JailVisit.belongsTo(Jail, { as: "jail", foreignKey: "jailId" });
  JailVisit.belongsTo(User, { as: "counselor", foreignKey: "counselorId" });
  JailVisit.belongsTo(User, { as: "approver", foreignKey: "approvedBy" });

  // Court Quotation associations
  CourtQuotation.belongsTo(Case, { as: "case", foreignKey: "caseNumber", targetKey: "caseNumber" });
  CourtQuotation.belongsTo(User, { as: "creator", foreignKey: "createdBy" });
  CourtQuotation.belongsTo(User, { as: "approver", foreignKey: "approvedBy" });

  // Password Reset associations
  PasswordReset.belongsTo(User, { as: "user", foreignKey: "userId" });
  PasswordReset.belongsTo(User, { as: "approver", foreignKey: "approvedBy" });

  // Message associations
  Message.belongsTo(User, { as: "client", foreignKey: "clientId" });
  Message.belongsTo(User, { as: "replier", foreignKey: "repliedBy" });
  User.hasMany(Message, { as: "sentMessages", foreignKey: "clientId" });
  User.hasMany(Message, { as: "repliedMessages", foreignKey: "repliedBy" });

  console.log("✅ Model associations set up successfully");
};

export default setupAssociations;
