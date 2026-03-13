USE [LASIMRA_IRIS]
GO
/****** Object:  Schema [SmartBoxData]    Script Date: 3/11/2026 8:02:46 PM ******/
CREATE SCHEMA [SmartBoxData]
GO
/****** Object:  Table [SmartBoxData].[EngineerInformations]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[EngineerInformations](
	[ID] [bigint] NOT NULL,
	[EngineerName] [nvarchar](100) NULL,
	[EngineerPhoneNumber] [bigint] NULL,
	[EngineerEmail] [nvarchar](100) NULL,
	[EngineerUserID] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_CommercialDepartmentMembers_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_CommercialDepartmentMembers_SMO](
	[ID] [bigint] NOT NULL,
	[AreaOfficeName] [nvarchar](100) NULL,
	[AreaOfficerEmail] [nvarchar](100) NULL,
	[Active] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_ConstructionCompanyDetails_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_ConstructionCompanyDetails_SMO](
	[ID] [bigint] NOT NULL,
	[RequestID] [bigint] NULL,
	[Name] [nvarchar](100) NULL,
	[Office_Address] [nvarchar](100) NULL,
	[Phone_No] [bigint] NULL,
	[RC_NO] [nvarchar](100) NULL,
	[Contact_Person_Name] [nvarchar](100) NULL,
	[Contact_Person_Phone] [bigint] NULL,
	[Contact_Person_Email] [nvarchar](100) NULL,
	[SiteRefNo] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_CustomerDetails_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_CustomerDetails_SMO](
	[ID] [bigint] NOT NULL,
	[CustomerId] [nvarchar](100) NULL,
	[CustomerName] [nvarchar](100) NULL,
	[OfficePhone] [bigint] NULL,
	[RCNO] [nvarchar](100) NULL,
	[OfficeAddress] [nvarchar](100) NULL,
	[ContactPersonName] [nvarchar](100) NULL,
	[ContactPersonPhoneNo] [bigint] NULL,
	[ContactPersonEmail] [nvarchar](100) NULL,
	[IsALTON] [bit] NULL,
	[StatusId] [bigint] NULL,
	[Arrears] [decimal](18, 2) NULL,
	[ContactPersonUserID] [nvarchar](100) NULL,
	[VerificationCode] [uniqueidentifier] NULL,
	[IsVerified] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_InfrastrucureCategory_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_InfrastrucureCategory_SMO](
	[InfrastructureID] [bigint] NOT NULL,
	[InfrastructureName] [nvarchar](100) NULL,
	[InfrastructureCode] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_LocalGovernment_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_LocalGovernment_SMO](
	[ID] [bigint] NOT NULL,
	[LGACode] [nvarchar](200) NULL,
	[LGAName] [nvarchar](200) NULL,
	[AreaOfficerName] [nvarchar](100) NULL,
	[AreaOfficerEmail] [nvarchar](100) NULL,
	[Active] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_MAST_Consultants_Details_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_MAST_Consultants_Details_SMO](
	[ID] [bigint] NOT NULL,
	[NameOfOrganization] [nvarchar](100) NULL,
	[Email] [nvarchar](100) NULL,
	[ContactPerson] [nvarchar](100) NULL,
	[OfficePhoneNo] [bigint] NULL,
	[RCNO] [nvarchar](100) NULL,
	[IsActive] [bit] NULL,
	[SiteRefNo] [bigint] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_MASTFees_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_MASTFees_SMO](
	[ID] [bigint] NOT NULL,
	[Code] [nvarchar](100) NULL,
	[Fee] [bigint] NULL,
	[ALTONFees] [bigint] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_Payment_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_Payment_SMO](
	[ID] [bigint] NOT NULL,
	[RequestID] [bigint] NULL,
	[CustomerID] [bigint] NULL,
	[PaymentFor] [nvarchar](100) NULL,
	[TxtRef] [nvarchar](100) NULL,
	[Status] [nvarchar](100) NULL,
	[flwRef] [nvarchar](100) NULL,
	[PaymentMode] [nvarchar](100) NULL,
	[AmountRequested] [decimal](18, 2) NULL,
	[AmountPaid] [decimal](18, 2) NULL,
	[CustomerEmail] [nvarchar](100) NULL,
	[LastMessage] [nvarchar](max) NULL,
	[ReturnStatus] [nvarchar](100) NULL,
	[ReturnChargeCode] [nvarchar](100) NULL,
	[ReturnPaymentType] [nvarchar](100) NULL,
	[IsCancelled] [bit] NULL,
	[HostedPaymentLink] [nvarchar](100) NULL,
	[RequestStatus] [nvarchar](100) NULL,
	[TimeStamp] [datetime] NULL,
	[BillPDFID] [bigint] NULL,
	[Pid] [nvarchar](100) NULL,
	[Receipt] [nvarchar](max) NULL,
	[paymentRef] [nvarchar](100) NULL,
	[PaymentStatus] [nvarchar](100) NULL,
	[PaymentStatusMessage] [nvarchar](100) NULL,
	[WfStart] [nvarchar](100) NULL,
	[HttpBillGeneration] [nvarchar](100) NULL,
	[RevenuCode] [nvarchar](100) NULL,
	[AgencyCode] [nvarchar](100) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_Permits_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_Permits_SMO](
	[ID] [bigint] NOT NULL,
	[RequestID] [bigint] NULL,
	[Permit] [nvarchar](max) NULL,
	[UploadDate] [datetime] NULL,
	[CreatedBy] [nvarchar](100) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_Request_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_Request_SMO](
	[RequestID] [bigint] NOT NULL,
	[CustomerID] [bigint] NULL,
	[RefNo] [nvarchar](100) NULL,
	[StatusID] [bigint] NULL,
	[RequestTitle] [nvarchar](100) NULL,
	[ApplicationDate] [datetime] NULL,
	[CommencementDate] [datetime] NULL,
	[CreatedByName] [nvarchar](100) NULL,
	[CreatedByDisplayName] [nvarchar](100) NULL,
	[PDFID] [bigint] NULL,
	[IsInstalled] [bit] NULL,
	[ProcessType] [bigint] NULL,
	[PermitYest] [bigint] NULL,
	[ApprovalDate] [datetime] NULL,
	[IsRenewed] [bit] NULL,
	[InspectionVisitDate] [date] NULL,
	[EngineerID] [bigint] NULL,
	[RoWProjectName] [nvarchar](100) NULL,
	[RoWProjectCategoryId] [bigint] NULL,
	[RoWInspectionVisitDate] [date] NULL,
	[RoWEngineerId] [bigint] NULL,
	[WGuid] [nvarchar](100) NULL,
	[Pay4it] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_ROWBillGenerationTeam_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_ROWBillGenerationTeam_SMO](
	[ID] [bigint] NOT NULL,
	[UserName] [nvarchar](100) NULL,
	[UserID] [nvarchar](100) NULL,
	[ProjectCategoryID] [bigint] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_ROWNumberOfWays_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_ROWNumberOfWays_SMO](
	[ID] [bigint] NOT NULL,
	[NumberOfWaysName] [nvarchar](100) NULL,
	[NumberOfWaysCode] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_ROWProcjectCategory_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_ROWProcjectCategory_SMO](
	[ID] [bigint] NOT NULL,
	[ProjectCategoryName] [nvarchar](100) NULL,
	[ProjectCategoryCode] [nvarchar](100) NULL,
	[FeePerMeter] [bigint] NULL,
	[ALTONFeePerMeter] [bigint] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_ROWTypsofPipes]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_ROWTypsofPipes](
	[ID] [bigint] NOT NULL,
	[PipesTypeName] [nvarchar](100) NULL,
	[PipesTypeCode] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_SiteCategory_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_SiteCategory_SMO](
	[ID] [bigint] NOT NULL,
	[Name] [nvarchar](100) NULL,
	[Code] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_SiteInspection_SMO_1]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_SiteInspection_SMO_1](
	[ID] [bigint] NOT NULL,
	[RequestID] [bigint] NULL,
	[InspectionDate] [date] NULL,
	[ROWSpecification] [bigint] NULL,
	[Client] [nvarchar](100) NULL,
	[Contractor] [nvarchar](100) NULL,
	[ContactPersonNumber] [nvarchar](100) NULL,
	[LocationRoutes] [nvarchar](max) NULL,
	[TotalDistance] [nvarchar](100) NULL,
	[Remarks] [nvarchar](max) NULL,
	[RouteBreakDownAsphalt] [nvarchar](100) NULL,
	[RouteBreakDownConcrete_] [nvarchar](100) NULL,
	[RouteBreakDownPavingStone] [nvarchar](100) NULL,
	[RouteBreakDownLawan] [nvarchar](100) NULL,
	[RouteBreakDownSoilEarth] [nvarchar](100) NULL,
	[RouteBreakDownThrustBoring] [nvarchar](100) NULL,
	[RouteBreakDownBrigeAttachment] [nvarchar](100) NULL,
	[RouteBreakDownNumberOfVulvePit_] [nvarchar](100) NULL,
	[RouteBreakDownJunctionBox] [nvarchar](100) NULL,
	[RouteBreakDownLeasingDuct] [nvarchar](100) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_SiteInspectionDetails_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_SiteInspectionDetails_SMO](
	[ID] [bigint] NOT NULL,
	[RequestID] [bigint] NULL,
	[LocationRoutes] [nvarchar](max) NULL,
	[RouteBreakDownAsphalt] [decimal](18, 2) NULL,
	[RouteBreakDownConcrete_] [decimal](18, 2) NULL,
	[RouteBreakDownPavingStone] [decimal](18, 2) NULL,
	[RouteBreakDownLawan] [decimal](18, 2) NULL,
	[RouteBreakDownSoilEarth] [decimal](18, 2) NULL,
	[RouteBreakDownThrustBoring] [decimal](18, 2) NULL,
	[RouteBreakDownBrigeAttachment] [decimal](18, 2) NULL,
	[RouteBreakDownNumberOfVulvePit_] [bigint] NULL,
	[JunctionBox] [decimal](18, 2) NULL,
	[LeasingDuct] [decimal](18, 2) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_StaffDetails_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_StaffDetails_SMO](
	[ID] [bigint] NOT NULL,
	[Name] [nvarchar](100) NULL,
	[EmailAddress] [nvarchar](100) NULL,
	[PhoneNumber] [bigint] NULL,
	[Designation] [nvarchar](100) NULL,
	[Role] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_StatusList_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_StatusList_SMO](
	[ID] [bigint] NOT NULL,
	[Status] [nvarchar](100) NULL,
	[StatusCode] [nvarchar](100) NULL,
	[Category] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_StructureType_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_StructureType_SMO](
	[StructureTypeID] [bigint] NOT NULL,
	[StructureTypeName] [nvarchar](100) NULL,
	[StructureTypeCode] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_SurveillanceGroups_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_SurveillanceGroups_SMO](
	[ID] [bigint] NOT NULL,
	[GroupName] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_SurveillanceTeams_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_SurveillanceTeams_SMO](
	[ID] [bigint] NOT NULL,
	[GroupName] [bigint] NULL,
	[UserName] [nvarchar](100) NULL,
	[UserID] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_SurvillanceRequest_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_SurvillanceRequest_SMO](
	[ID] [bigint] NOT NULL,
	[RequestID_1] [bigint] NULL,
	[SiteName] [nvarchar](100) NULL,
	[SiteAddress] [nvarchar](max) NULL,
	[LGAID] [bigint] NULL,
	[Subject] [nvarchar](100) NULL,
	[InfrastrucureCategory] [bigint] NULL,
	[IsCustomerRegistered] [bit] NULL,
	[CustomerID] [bigint] NULL,
	[IsEquipmentRegistered] [bit] NULL,
	[RequestID] [bigint] NULL,
	[ViolationType] [bigint] NULL,
	[Overview] [nvarchar](max) NULL,
	[Details] [nvarchar](max) NULL,
	[ActionTaken] [nvarchar](max) NULL,
	[PenaltyFees] [decimal](18, 2) NULL,
	[GroupID] [bigint] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_SystemKeys_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_SystemKeys_SMO](
	[ID] [bigint] NOT NULL,
	[KeyCode] [nvarchar](100) NULL,
	[Key] [nvarchar](100) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_TowerMast_Reqeust_SMO](
	[MastID] [bigint] NOT NULL,
	[RequestID] [bigint] NULL,
	[SiteAddress] [nvarchar](max) NULL,
	[Longtitude] [decimal](18, 2) NULL,
	[Latitude] [decimal](18, 2) NULL,
	[Elevation] [decimal](18, 2) NULL,
	[LoadCapacity] [nvarchar](100) NULL,
	[RFRadiationLevel] [nvarchar](100) NULL,
	[RadiusOfPotentialHazardArea] [nvarchar](100) NULL,
	[SiteCategory] [bigint] NULL,
	[OtherSiteCategory] [nvarchar](100) NULL,
	[TypeOfStructure] [bigint] NULL,
	[StructureHeight] [decimal](18, 2) NULL,
	[Comment] [nvarchar](max) NULL,
	[ItemFee] [decimal](18, 2) NULL,
	[SiteRefNo] [nvarchar](100) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_TowerMast_Request_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_TowerMast_Request_SMO](
	[MastID] [bigint] NOT NULL,
	[RequestID] [bigint] NULL,
	[Comment] [nvarchar](max) NULL,
	[LocalGovernmentArea_] [bigint] NULL,
	[SiteNameSiteID] [nvarchar](100) NULL,
	[ConsultantID_] [bigint] NULL,
	[CountOfMasts] [bigint] NULL,
	[SiteAssessmentFees] [decimal](18, 2) NULL,
	[SiteRefNo] [nvarchar](100) NULL,
	[ReqRefNo] [nvarchar](100) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_TowerMastDetails_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_TowerMastDetails_SMO](
	[ID] [bigint] NOT NULL,
	[Reference_Number] [nvarchar](100) NULL,
	[Site_Address] [nvarchar](max) NULL,
	[Local_Government_Area] [bigint] NULL,
	[Site_Name__SiteID__Code_] [nvarchar](100) NULL,
	[Longtitude] [nvarchar](100) NULL,
	[Latitude] [nvarchar](100) NULL,
	[Elevation] [nvarchar](100) NULL,
	[Load_Capacity] [nvarchar](100) NULL,
	[RF_Radiation_Level] [nvarchar](100) NULL,
	[Radius_of_Potential_Hazard_Area] [nvarchar](100) NULL,
	[Site_Category] [bigint] NULL,
	[Other_Site_Category] [nvarchar](100) NULL,
	[Type_of_Structure__Tower__Mast_] [bigint] NULL,
	[StructureHeight] [decimal](18, 2) NULL,
	[Comment_] [nvarchar](max) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [SmartBoxData].[LASIMRA_ViolationTypes_SMO]    Script Date: 3/11/2026 8:02:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [SmartBoxData].[LASIMRA_ViolationTypes_SMO](
	[ViolationID] [bigint] NOT NULL,
	[ViolationName] [nvarchar](100) NULL,
	[ViolationCode] [nvarchar](100) NULL
) ON [PRIMARY]
GO
