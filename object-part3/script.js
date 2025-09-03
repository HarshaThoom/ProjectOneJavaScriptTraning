/*jslint browser: true, long: true, for: true, this: true*/
/*global window, client */

//File namespace
var Opportunity = window.NameSpace || {};

//Reseting the save context
var SaveContext = null;
var formAlreadyLoaded = null;

var LogicalNamePlural = "opportunities";
var NameAttribute = "name";
var JobTypeAttribute = "sbs_jobtype";
var JobSubTypeAttribute = "sbs_jobsubtype";
var ParentOpportunityAttribute = "sbs_parentopportunity";
var ProjectIdAttribute = "arm_projectid";
var ProjectContractIdAttribute = "arm_projectcontractid";
var ServiceAccountAttribute = "parentaccountid";
var BillToAttribute = "arm_billto";
var ProposalApprovedAttribute = "arm_proposal_approved";
var OTCApprovedAttribute = "arm_otcapproval";
var ContractApprovedAttribute = "arm_contract_approved";
var LOIApprovedAttribute = "arm_loi_approved";
var LoiAttribute = "sbs_loi";
var StateAttribute = "statecode";
var ChangeOrderAttribute = "arm_changeorder";
var AutoRenewAttribute = "sbs_autorenew";
var SalesTerritoryAttribute = "arm_salesterritory";
var FieldOfficeAttribute = "arm_fieldoffice";
var LOIReceivedOnAttribute = "sbs_loireceivedon";
var IsRenewalAttribute = "arm_is_renewal";
var EstCompletionDateAttribute = "sbs_estcompletiondate";
var StartDateAttribute = "sbs_startdate";

var PriorQuotesTotal = "arm_prioryearquotestotal";
var PriorQuotesTotalCostPrices = "arm_prioryearquotestotalcostprices";
var PriorGrossMargin = "arm_prioryeargrossmargin";
var YoyQuotesTotalAmount = "arm_yoyquotestotalamount";
var YoyQuotesTotalCostPrices = "arm_yoyquotestotalcostprices";
var YoyGrossMargin = "arm_yoygrossmargin";

var ContactAttribute = "parentcontactid";

//BPF fields name
var BPFProposalApprovedAttribute = "header_process_arm_proposal_approved";
var BPFLoiAttribute = "header_process_sbs_loi";
var BPFLOIReceivedOnAttribute = "header_process_sbs_loireceivedon";
var BPFStatusFinished = "finished";
var BPFServiceAccountAttribute = "header_process_parentaccountid";
var BPFBillToAttribute = "header_process_arm_billto";

var TabSummary = "Summary";

var ApprovalTrackingApprovalStatusValue_Waiting = 858800000;
var ApprovalTrackingApprovalStatusValue_Rejected = 858800002;
var TypeOfApprovalValue_LOI = 100000001;
var ChangeOrderValue_YES = 1;


// Option Sets
Opportunity.JobSubTypeForService = [
    {
        text: "Misc Parts",
        value: 858800000
    },
    {
        text: "Agreements",
        value: 858800004
    },
    {
        text: "MAC Turnkey",
        value: 100000000
    },
    {
        text: "MAC Parts & Smarts",
        value: 100000002
    },
    {
        text: "Quoted Service",
        value: 100000001
    }
];

// Option Sets
Opportunity.JobSubTypeForSolutions = [
    {
        text: "Turnkey",
        value: 858800002
    },
    {
        text: "Parts & Smarts",
        value: 858800006
    },
    {
        text: "Warranty",
        value: 858800007
    }
];




//BPF Stage categories
var ProposalStagesCategories = Object.create(null);
ProposalStagesCategories = {
    ProposalSolutions: 100000004,
    ProposalServices: 100000011,
    ProposalOTC: 100000001
};

var ContractReviewStagesCategories = Object.create(null);
ContractReviewStagesCategories = {
    ContractReviewSolutions: 100000007,
    ContractReviewServices: 100000014
};

var EstimateStagesCategories = Object.create(null);
EstimateStagesCategories = {
    EstimateSolutions: 100000003,
    EstimateServices: 100000009,
    EstimateMAC: 100000010,
    EstimateOTC: 100000000
};

var ContractPrepStagesCategories = Object.create(null);
ContractPrepStagesCategories = {
    ContractPrepSolutions: 100000006,
    ContractPrepServices: 100000013
};

var CloseStagesCategories = Object.create(null);
CloseStagesCategories = {
    CloseSolutions: 100000008,
    CloseServices: 100000015,
    CloseOTC: 100000002
};
//Approval types
var ApprovalTypes = Object.create(null);
ApprovalTypes = {
    Proposal: 100000000,
    Contract: 100000002
};
QuoteStatus = {
    Won: 858800000,
    Cancelled: 6
};

// Opportunity On Load
Opportunity.onLoad = function () {
    "use strict";
    if (formAlreadyLoaded === null) {
        formAlreadyLoaded = true;

        //ARM Task 98061: Configuration: Job Subtype
        client.getAttribute(JobTypeAttribute).addOnChange(Opportunity.filterJobSubTypeAttribute);
        Opportunity.filterJobSubTypeAttribute();
        Opportunity.removeTMJobSubType();

        //BPF Stage PreChanged - task 99481
        FormContext.data.process.addOnPreStageChange(Opportunity.onPreStageChange);

        //BPF Stage PreChanged - task 99481
        FormContext.data.process.addOnProcessStatusChange(Opportunity.ReevaluateCloseAsWonVisibitlity);

        //CRD 9826L
        client.getAttribute(ParentOpportunityAttribute).addOnChange(Opportunity.parentOpportunityChanged);

        //Lock BPF fields - task 99481
        FormContext.data.addOnLoad(Opportunity.LockBPFFields);

        //task 119162
        if (client.getAttribute(LoiAttribute) != null)
            client.getAttribute(LoiAttribute).addOnChange(Opportunity.LoiFieldsLogic);

        //YP - adding conditional to avoid error
        if (client.getAttribute(LOIReceivedOnAttribute) != null)
            client.getAttribute(LOIReceivedOnAttribute).addOnChange(Opportunity.LoiFieldsLogic);

        //Task 118358
        FormContext.data.entity.addOnSave(Opportunity.ValidateQuotes);

        //119729
        client.getAttribute(ChangeOrderAttribute).addOnChange(Opportunity.COFieldsLogic);
        FormContext.data.addOnLoad(Opportunity.COFieldsLogic);
        FormContext.data.addOnLoad(Opportunity.IsRenewalFieldLogic);

        // 184771
        if (FormContext.ui.getFormType() === 1) {
            client.getAttribute(ChangeOrderAttribute).addOnChange(Opportunity.onChangeOrderUpdateEstimatedCompletionDate);
            client.getAttribute(ParentOpportunityAttribute).addOnChange(Opportunity.onChangeOrderUpdateEstimatedCompletionDate);
        }

        //183185
        client.getAttribute(ChangeOrderAttribute).addOnChange(Opportunity.onChangeOrderField);

        //YP - CRD 11451
        if (client.getAttribute(IsRenewalAttribute) != null)
            client.getAttribute(IsRenewalAttribute).addOnChange(Opportunity.IsRenewalShowHide);
        Opportunity.IsRenewalShowHide();
        //This is not working as expected, so implemented this along with CO logic
        //Opportunity.SetReadOnlyFieldsRenewalAfterCreation();

        FormContext.data.entity.addOnSave(Opportunity.SetAutoRenew);
    }
};

//183185
Opportunity.onChangeOrderField = function () {
    var changeOrderValue = client.getAttributeValue(ChangeOrderAttribute);

    if (changeOrderValue === false || changeOrderValue === 0) {
        client.setAttributeValue(AutoRenewAttribute, 858800001);
    } else {
        client.setAttributeValue(AutoRenewAttribute, 858800000);
    }
}

Opportunity.onChangeOrderUpdateEstimatedCompletionDate = function () {
    var isChangeOrder = FormContext.getAttribute(ChangeOrderAttribute)?.getValue();
    var parentOpportunity = FormContext.getAttribute(ParentOpportunityAttribute)?.getValue();

    if (isChangeOrder && parentOpportunity) {
        var parentOpportunityId = parentOpportunity[0].id.replace(/[{}]/g, "");

        Xrm.WebApi.retrieveRecord("opportunity", parentOpportunityId, `?$select=${EstCompletionDateAttribute},${StartDateAttribute}`).then(
            function success(result) {
                if (result[EstCompletionDateAttribute]) {
                    var retrievedDate = new Date(result[EstCompletionDateAttribute]);
                    client.setAttributeValue(EstCompletionDateAttribute, retrievedDate);
                }
                if (result[StartDateAttribute]) {
                    var retrievedDate = new Date(result[StartDateAttribute]);
                    client.setAttributeValue(StartDateAttribute, retrievedDate);
                }
            },
            function error(error) {
                console.error("Error retrieving Parent Opportunity:", error.message);
            }
        );
    }
}

Opportunity.IsRenewalFieldLogic = function () {
    var loiApp = client.getAttributeValue(LOIApprovedAttribute);
    if (loiApp == 1)
        client.setDisabled(IsRenewalAttribute, true);
    //added for ticket 5635
    //Opportunity.IsRenewalValidation();
};

//CRD 9826L
//COFieldsLogic - task 119729
Opportunity.COFieldsLogic = function () {

    FormContext.getAttribute(JobTypeAttribute).setRequiredLevel("required");
    FormContext.getAttribute(JobSubTypeAttribute).setRequiredLevel("required");
    FormContext.getAttribute(FieldOfficeAttribute).setRequiredLevel("required");

    var isco = client.getAttributeValue(ChangeOrderAttribute);
    let isRenewal = client.getAttributeValue(IsRenewalAttribute);
    if (isco == null || isco == false || isco == 0) {
        FormContext.getAttribute(ParentOpportunityAttribute).setRequiredLevel("none");
        //added on 06_02_23 to reset parent opportunity and related fields when change order = no
        if (client.getAttribute(ChangeOrderAttribute).getIsDirty() == true) {
            client.setAttributeValue(ParentOpportunityAttribute, null);
            client.setAttributeValue(ProjectIdAttribute, null);
            client.setAttributeValue(ProjectContractIdAttribute, null);
            client.setAttributeValue(ServiceAccountAttribute, null);
            client.setAttributeValue(BillToAttribute, null);
            client.setAttributeValue(JobTypeAttribute, null);
            client.setAttributeValue(JobSubTypeAttribute, null);
            client.setAttributeValue(SalesTerritoryAttribute, null);
            client.setAttributeValue(FieldOfficeAttribute, null);
        }
        //end add
        //client.setDisabled(ServiceAccountAttribute, false); // Removied because of bug: #14074
        client.setDisabled(BillToAttribute, false);
        client.setDisabled(JobTypeAttribute, false);
        client.setDisabled(JobSubTypeAttribute, false);
        client.setDisabled(SalesTerritoryAttribute, false);
        client.setDisabled(FieldOfficeAttribute, false);
        client.setVisibility(ParentOpportunityAttribute, false);

        //Adding the below, bug was raised here Task 123552
        Opportunity.LockAccountsInHeader(false);

    }
    else if (isco) {
        client.setVisibility(ParentOpportunityAttribute, true);
        FormContext.getAttribute(ParentOpportunityAttribute).setRequiredLevel("required");
        client.setDisabled(ServiceAccountAttribute, true);
        client.setDisabled(BillToAttribute, true);
        client.setDisabled(JobTypeAttribute, true);
        client.setDisabled(JobSubTypeAttribute, true);
        client.setDisabled(SalesTerritoryAttribute, true);
        client.setDisabled(FieldOfficeAttribute, true);

        //Adding the below, bug was raised here Task 123552
        Opportunity.LockAccountsInHeader(true);
    }
    if (isRenewal != null && isRenewal && client.getId()) {
        client.setDisabled(IsRenewalAttribute, true);
        client.setDisabled(ParentOpportunityAttribute, true);
        client.setDisabled(ServiceAccountAttribute, true);
        client.setDisabled(BillToAttribute, true);
        client.setDisabled(JobTypeAttribute, true);
        client.setDisabled(JobSubTypeAttribute, true);
        client.setDisabled(FieldOfficeAttribute, true);
    }

    Opportunity.ContactOrOTCApproved();
};

//95354 Additional updates: If Contract or OTC Approval contains data, make Service To and Bill To account read-only 
Opportunity.ContactOrOTCApproved = function () {
    if (client.getAttribute(ContractApprovedAttribute).getValue() != null || client.getAttribute(OTCApprovedAttribute).getValue() != null) {
        client.setDisabled(BillToAttribute, true);
        client.setDisabled(ServiceAccountAttribute, true);
        client.setDisabled(BPFBillToAttribute, true);
        if (FormContext.getControl("header_process_parentaccountid") != null)
            FormContext.getControl("header_process_parentaccountid").setDisabled(true);
        if (FormContext.getControl("header_process_parentaccountid_1") != null)
            FormContext.getControl("header_process_parentaccountid_1").setDisabled(true);
        if (FormContext.getControl("header_process_parentaccountid_2") != null)
            FormContext.getControl("header_process_parentaccountid_2").setDisabled(true);
        if (FormContext.getControl("header_process_parentaccountid_3") != null)
            FormContext.getControl("header_process_parentaccountid_3").setDisabled(true);
        if (FormContext.getControl("header_process_arm_billto") != null)
            FormContext.getControl("header_process_arm_billto").setDisabled(true);
        if (FormContext.getControl("header_process_arm_billto_1") != null)
            FormContext.getControl("header_process_arm_billto_1").setDisabled(true);
        if (FormContext.getControl("header_process_arm_billto_2") != null)
            FormContext.getControl("header_process_arm_billto_2").setDisabled(true);

    }

};

Opportunity.LockAccountsInHeader = function (lck) {
    if (FormContext.getControl("header_process_parentaccountid") != null)
        FormContext.getControl("header_process_parentaccountid").setDisabled(lck);
    if (FormContext.getControl("header_process_parentaccountid_1") != null)
        FormContext.getControl("header_process_parentaccountid_1").setDisabled(lck);
    if (FormContext.getControl("header_process_parentaccountid_2") != null)
        FormContext.getControl("header_process_parentaccountid_2").setDisabled(lck);
    if (FormContext.getControl("header_process_parentaccountid_3") != null)
        FormContext.getControl("header_process_parentaccountid_3").setDisabled(lck);
    if (FormContext.getControl("header_process_arm_billto") != null)
        FormContext.getControl("header_process_arm_billto").setDisabled(lck);
    if (FormContext.getControl("header_process_arm_billto_1") != null)
        FormContext.getControl("header_process_arm_billto_1").setDisabled(lck);
    if (FormContext.getControl("header_process_arm_billto_2") != null)
        FormContext.getControl("header_process_arm_billto_2").setDisabled(lck);
}

//Task 118358
Opportunity.ValidateQuotes = function (context) {
    if (AlertDialogShown) {
        context.getEventArgs().preventDefault();
        return;
    }

    if ((client.getAttribute(LoiAttribute).getIsDirty() || client.getAttribute(LOIReceivedOnAttribute).getIsDirty()) && client.getAttributeValue(LOIReceivedOnAttribute) != null) {

        var error = Opportunity.ValidateQuotesLogic();

        if (error != null) {
            AlertDialogShown = true;
            client.openAlertDialog("Close", error, function () { AlertDialogShown = false; }, null);
            context.getEventArgs().preventDefault();
            return;
        }
    }
};

Opportunity.ValidateQuotesLogic = function () {

    var error = null;

    var loiContrl = client.getControl(BPFLoiAttribute);
    var loi = loiContrl.getAttribute().getValue();
    if (loi == 1) {

        var atLeastOneQuoteIsWon = false;
        var atLeastOneQuoteIsNotWonOrCancelled = false;
        var req = new XMLHttpRequest();
        req.open("GET", client.getWebApiEndpoint() + "/quotes?$select=statuscode&$filter=_opportunityid_value eq " + client.getId(), false);
        req = client.setXMLHttpRequestObject(req);
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    for (var i = 0; i < results.value.length; i++) {
                        var statuscode = results.value[i]["statuscode"];
                        if (statuscode != QuoteStatus.Won && statuscode != QuoteStatus.Cancelled) {
                            atLeastOneQuoteIsNotWonOrCancelled = true;
                            return;
                        }
                        if (statuscode == QuoteStatus.Won) {
                            atLeastOneQuoteIsWon = true;
                        }
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();

        if (atLeastOneQuoteIsNotWonOrCancelled) {
            error = "Some quotes are not closed, please close them and try again.";
        }

        if (!atLeastOneQuoteIsWon) {
            error = "At least one quote should be closed as won.";
        }
    }
    return error;
};

//task 119162

Opportunity.LoiFieldsLogic = function () {
    var loiContrl = client.getControl(BPFLoiAttribute);
    var loi = loiContrl.getAttribute().getValue();
    if (loi == 1)
        client.setAttributeValue(LOIApprovedAttribute, 0);
    else if (client.getAttributeValue(LOIApprovedAttribute) == null && client.getAttributeValue("sbs_loi") == 1 && client.getAttributeValue("sbs_loireceivedon") != null)
        client.setAttributeValue(LOIApprovedAttribute, 0);
    else
        client.setAttributeValue(LOIApprovedAttribute, null);
};

//Reevaluate Close As Won Visibitlity - task 99481
Opportunity.ReevaluateCloseAsWonVisibitlity = function () {
    //Get the active process
    var process = FormContext.data.process;
    if (process !== null) {
        //Check if the process is finished, then refresh the ribbon
        var status = process.getStatus();
        if (status == BPFStatusFinished)
            FormContext.ui.refreshRibbon();
    }
};

//Close As Won Visibitlity - task 99481
Opportunity.CloseAsWonVisibitlity = function () {
    //Get the active process
    var process = FormContext.data.process;
    if (process !== null) {
        //Check if the process is finished, then show the Close As Won button
        var status = process.getStatus();
        if (status == BPFStatusFinished)
            return true;
    }
    return false;
};

//Lock BPF fields - task 99481
Opportunity.LockBPFFields = function () {
    client.setDisabled(BPFProposalApprovedAttribute, true);
    //added on 10/19 to lock change order after proposal approval
    if (client.getAttributeValue(ProposalApprovedAttribute) === 1) {
        client.setDisabled(ChangeOrderAttribute, true);
    } else { client.setDisabled(ChangeOrderAttribute, false); }
    //end add
    var loiReceiveOnCtrl = client.getControl(BPFLOIReceivedOnAttribute);
    if (!client.isNullOrUndefined(loiReceiveOnCtrl) && loiReceiveOnCtrl.getAttribute().getValue() !== null) {
        client.setDisabled(BPFLoiAttribute, true);
        client.setDisabled(BPFLOIReceivedOnAttribute, true);
    }
};

//BPF Stage PreChanged - task 99481
Opportunity.onPreStageChange = function (executionContext) {

    //Get the eventArgs
    var eventArgs = executionContext.getEventArgs();

    //check first if the opportunity is open
    var opportunityState = client.getAttributeValue(StateAttribute);
    if (opportunityState !== 0) {
        eventArgs.preventDefault();
        client.openAlertDialog("Hide", "This opportunity is closed.", null, null);
        return;
    }

    //Get the active process
    var process = FormContext.data.process;

    if (process !== null) {

        //Get the active stage object
        var activeStageObj = process.getActiveStage();

        //Get the selected stage object
        var selectedStageObj = process.getSelectedStage();

        //Dont allow to go back using the Set Active button
        var activeStageId = activeStageObj.getId();
        var selectedStageId = selectedStageObj.getId();

        if (activeStageId != selectedStageId) {

            //Prevent save
            eventArgs.preventDefault();
            client.openAlertDialog("Close", "You cannot use the Set Active button, please use the arrow buttons in the active stage to navigate the process.", null, null);

            return;
        }

        //Get the active stage value
        var activeStageObjCategory = activeStageObj.getCategory().getValue();

        //Check if active stage is an estimate or contract prep stage
        if (Object.values(EstimateStagesCategories).includes(activeStageObjCategory) || Object.values(ContractPrepStagesCategories).includes(activeStageObjCategory)) {

            //Get the direction of the progression
            var direction = eventArgs._direction;

            //User is moving forward to an approval stage
            if (direction === 0) {

                //Prepare the input parameters for the custom api

                //Type of approval
                var approvalType;
                if (Object.values(EstimateStagesCategories).includes(activeStageObjCategory))
                    approvalType = ApprovalTypes.Proposal;
                else
                    approvalType = ApprovalTypes.Contract;

                //Check for incomplete 
                if (approvalType == ApprovalTypes.Contract) {

                    var error = Opportunity.ValidateQuotesLogic();
                    if (error != null) {
                        //Prevent save
                        eventArgs.preventDefault();
                        client.openAlertDialog("Close", error, null, null);
                        return;
                    }

                    var approvalIncomplete = Opportunity.checkForIncompleteApproval(activeStageObjCategory);
                    if (approvalIncomplete) {
                        //Prevent save
                        eventArgs.preventDefault();
                        client.openAlertDialog("Close", "Opportunity cannot be advanced until all approvals are complete.", null, null);
                        return;
                    }

                }

                //Id, name, jobsubtype
                var id = client.getId();
                var name = client.getAttributeValue(NameAttribute);
                var jobtype = client.getAttributeValue(JobTypeAttribute);
                var jobsubtype = client.getAttributeValue(JobSubTypeAttribute);

                //Prevent save in case something goes wrong
                eventArgs.preventDefault();

                //Show progress
                Xrm.Utility.showProgressIndicator("Creating approvals..");

                //Create approvals
                setTimeout(function () { Opportunity.createApprovals(id, name, jobtype, jobsubtype, approvalType); }, 2000);

            }
        }

        //Check if active stage is a proposal or contrat review stage
        else if (Object.values(ProposalStagesCategories).includes(activeStageObjCategory) || Object.values(ContractReviewStagesCategories).includes(activeStageObjCategory)) {

            //Get the direction of the progression
            var direction = eventArgs._direction;

            //User is moving forward to the next stage
            if (direction === 0) {

                //Check if there still any remaining incomplete approvals
                var approvalIncomplete = Opportunity.checkForIncompleteApproval(activeStageObjCategory);

                if (approvalIncomplete) {
                    //Prevent save
                    eventArgs.preventDefault();
                    client.openAlertDialog("Close", "Opportunity cannot be advanced until all approvals are complete.", null, null);
                    return;
                }
            }
            //User is moving backward to the estimate or contract prep stage
            else {

                //Find the unique Proposal or Contract ATR related to the actual opportunity with status Waiting and cancel it which will cancel all the approval process.

                //Type of approval
                var approvalType;
                if (Object.values(ProposalStagesCategories).includes(activeStageObjCategory))
                    approvalType = ApprovalTypes.Proposal;
                else
                    approvalType = ApprovalTypes.Contract;

                //Id of current opportunity
                var id = client.getId();

                //Prevent save in case something goes wrong
                eventArgs.preventDefault();

                //Show progress
                Xrm.Utility.showProgressIndicator("Cancelling unapproved approvals..");

                //Cancel approvals
                setTimeout(function () { Opportunity.cancelApprovals(id, approvalType); }, 2000);
            }
        }
    }
};

//BPF Stage createApprovals - task 99481
Opportunity.createApprovals = function (id, name, jobtype, jobsubtype, approvalType) {
    var parameters = {};
    var entity = {};
    entity.id = id;
    entity.entityType = "opportunity";
    parameters.entity = entity;
    parameters.arm_approvaltype = approvalType;
    parameters.arm_name = name;
    parameters.arm_jobtype = jobtype;
    parameters.arm_jobsubtype = jobsubtype;

    var arm_CreateApprovalsForOpportunityRequest = {
        entity: parameters.entity,
        arm_approvaltype: parameters.arm_approvaltype,
        arm_name: parameters.arm_name,
        arm_jobtype: parameters.arm_jobtype,
        arm_jobsubtype: parameters.arm_jobsubtype,

        getMetadata: function () {
            return {
                boundParameter: "entity",
                parameterTypes: {
                    "entity": {
                        "typeName": "mscrm.opportunity",
                        "structuralProperty": 5
                    },
                    "arm_approvaltype": {
                        "typeName": "Edm.Int32",
                        "structuralProperty": 1
                    },
                    "arm_name": {
                        "typeName": "Edm.String",
                        "structuralProperty": 1
                    },
                    "arm_jobtype": {
                        "typeName": "Edm.Int32",
                        "structuralProperty": 1
                    },
                    "arm_jobsubtype": {
                        "typeName": "Edm.Int32",
                        "structuralProperty": 1
                    }
                },
                operationType: 0,
                operationName: "arm_CreateApprovalsForOpportunity"
            };
        }
    };

    Xrm.WebApi.online.execute(arm_CreateApprovalsForOpportunityRequest).then(
        function success(result) {
            Xrm.Utility.closeProgressIndicator();
            if (result.ok) {
                Xrm.Utility.showProgressIndicator("Reloading..");
                setTimeout(function () { FormContext.data.refresh(true).then(Xrm.Utility.closeProgressIndicator(), null); }, 2000);
            }
        },
        function (error) {
            Xrm.Utility.closeProgressIndicator();
            var message;
            if (error !== null && error.message !== null && error.message !== "")
                message = error.message;
            else
                message = "Something went wrong, please contact your administrator.";
            client.openErrorDialog(message, null, null);
        }
    );
};

//BPF Stage cancelApprovals - task 99481
Opportunity.cancelApprovals = function (id, approvalType) {
    var parameters = {};
    var entity = {};
    entity.id = id;
    entity.entityType = "opportunity";
    parameters.entity = entity;
    parameters.arm_approvaltype = approvalType;

    var arm_CancelApprovalsForOpportunityRequest = {
        entity: parameters.entity,
        arm_approvaltype: parameters.arm_approvaltype,

        getMetadata: function () {
            return {
                boundParameter: "entity",
                parameterTypes: {
                    "entity": {
                        "typeName": "mscrm.opportunity",
                        "structuralProperty": 5
                    },
                    "arm_approvaltype": {
                        "typeName": "Edm.Int32",
                        "structuralProperty": 1
                    }
                },
                operationType: 0,
                operationName: "arm_CancelApprovalsForOpportunity"
            };
        }
    };

    Xrm.WebApi.online.execute(arm_CancelApprovalsForOpportunityRequest).then(
        function success(result) {
            Xrm.Utility.closeProgressIndicator();
            if (result.ok) {
                Xrm.Utility.showProgressIndicator("Reloading..");
                setTimeout(function () { FormContext.data.refresh(true).then(Xrm.Utility.closeProgressIndicator(), null); }, 2000);
            }
        },
        function (error) {
            Xrm.Utility.closeProgressIndicator();
            var message;
            if (error !== null && error.message !== null && error.message !== "")
                message = error.message;
            else
                message = "Something went wrong, please contact your administrator.";
            client.openErrorDialog(message, null, null);
        }
    );
};

//BPF Stage checkForIncompleteApproval - task 99481
Opportunity.checkForIncompleteApproval = function (activeStageObjCategory) {

    //Proposal
    if (activeStageObjCategory === ProposalStagesCategories.ProposalSolutions || activeStageObjCategory === ProposalStagesCategories.ProposalServices) {
        if (client.getAttributeValue(ProposalApprovedAttribute) === 0)
            return true;
    }

    //OTC
    if (activeStageObjCategory === ProposalStagesCategories.ProposalOTC) {
        if (client.getAttributeValue(OTCApprovedAttribute) === 0)
            return true;
    }

    //LOI
    if (activeStageObjCategory === ContractPrepStagesCategories.ContractPrepSolutions) {
        if (client.getAttributeValue(LOIApprovedAttribute) === 0)
            return true;
    }

    //Contract
    if (activeStageObjCategory === ContractReviewStagesCategories.ContractReviewSolutions || activeStageObjCategory === ContractReviewStagesCategories.ContractReviewServices) {
        if (client.getAttributeValue(ContractApprovedAttribute) === 0 ||
            client.getAttributeValue(LoiAttribute) === 1 && client.getAttributeValue(LOIApprovedAttribute) === 0)
            return true;
    }
    return false;
};

//CRD 9826L
Opportunity.changeOrderChecks = function () {
    "use strict";

    var parentOpportunityId = client.getLookupId(ParentOpportunityAttribute);
    //Show progress
    Xrm.Utility.showProgressIndicator("Checking change order information..");
    setTimeout(function () { Opportunity.checkParentOpportunityProjectInformation(parentOpportunityId); }, 2000);

};

//checkParentOpportunityProjectInformation
Opportunity.checkParentOpportunityProjectInformation = function (parentOpportunityId) {
    "use strict";
    var parentOpportunity = client.retrieveSingleRecordSynchronous(LogicalNamePlural, parentOpportunityId, ProjectIdAttribute + "," + ProjectContractIdAttribute + "," + "_" + ServiceAccountAttribute + "_value" + "," + "_" + BillToAttribute + "_value" + "," + "_" + SalesTerritoryAttribute + "_value" + "," + "_" + FieldOfficeAttribute + "_value" + "," + JobTypeAttribute + "," + JobSubTypeAttribute);

    //Close progress
    Xrm.Utility.closeProgressIndicator();
    if (parentOpportunity === null) {
        AlertDialogShown = true;
        client.setAttributeValue(ParentOpportunityAttribute, null);
        client.openErrorDialog("An error occured. The data were not saved. Please contact your administrator.", function () { AlertDialogShown = false; }, null);
    }
    else {
        //Check if both Project and Contract are null on the Parent
        var projectId = parentOpportunity[ProjectIdAttribute];
        var projectContractId = parentOpportunity[ProjectContractIdAttribute];
        if (projectId === null && projectContractId === null) {
            //If so confirm preventing user from saving
            AlertDialogShown = true;
            client.setAttributeValue(ParentOpportunityAttribute, null);
            client.openAlertDialog("Close", "A Project ID and/or Project Contract ID is required in order to link this opportunity.", function () { AlertDialogShown = false; }, null);
        }
        else {
            //If not save the data
            var _parentaccountid_value = parentOpportunity["_parentaccountid_value"];
            var _parentaccountid_value_formatted = parentOpportunity["_parentaccountid_value@OData.Community.Display.V1.FormattedValue"];
            var _parentaccountid_value_lookuplogicalname = parentOpportunity["_parentaccountid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
            var _arm_billto_value = parentOpportunity["_arm_billto_value"];
            var _arm_billto_value_formatted = parentOpportunity["_arm_billto_value@OData.Community.Display.V1.FormattedValue"];
            var _arm_billto_value_lookuplogicalname = parentOpportunity["_arm_billto_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
            var _jobType = parentOpportunity[JobTypeAttribute];
            var _jobSubType = parentOpportunity[JobSubTypeAttribute];
            var _arm_salesterritory_value = parentOpportunity["_arm_salesterritory_value"];
            var _arm_salesterritory_valueformatted = parentOpportunity["_arm_salesterritory_value@OData.Community.Display.V1.FormattedValue"];
            var _arm_salesterritory_valuelookuplogicalname = parentOpportunity["_arm_salesterritory_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
            var _arm_fieldoffice_value = parentOpportunity["_arm_fieldoffice_value"];
            var _arm_fieldoffice_valueformatted = parentOpportunity["_arm_fieldoffice_value@OData.Community.Display.V1.FormattedValue"];
            var _arm_fieldoffice_valuelookuplogicalname = parentOpportunity["_arm_fieldoffice_value@Microsoft.Dynamics.CRM.lookuplogicalname"];

            client.setAttributeValue(ProjectIdAttribute, projectId);
            client.setAttributeValue(ProjectContractIdAttribute, projectContractId);
            client.setLookupByParams(ServiceAccountAttribute, _parentaccountid_value_lookuplogicalname, _parentaccountid_value, _parentaccountid_value_formatted);
            client.setLookupByParams(BillToAttribute, _arm_billto_value_lookuplogicalname, _arm_billto_value, _arm_billto_value_formatted);
            client.setAttributeValue(JobTypeAttribute, _jobType);
            client.setAttributeValue(JobSubTypeAttribute, _jobSubType);
            client.setLookupByParams(SalesTerritoryAttribute, _arm_salesterritory_valuelookuplogicalname, _arm_salesterritory_value, _arm_salesterritory_valueformatted);
            client.setLookupByParams(FieldOfficeAttribute, _arm_fieldoffice_valuelookuplogicalname, _arm_fieldoffice_value, _arm_fieldoffice_valueformatted);
        }
    }
};

//CRD 9826L
Opportunity.parentOpportunityChanged = function () {
    "use strict";
    //When parent opportunity is cleared, clear the fields
    var parentOpportunityLookUp = client.getLookup(ParentOpportunityAttribute);
    if (parentOpportunityLookUp === null) {
        client.setAttributeValue(ProjectIdAttribute, null);
        client.setAttributeValue(ProjectContractIdAttribute, null);
        client.setAttributeValue(ServiceAccountAttribute, null);
        client.setAttributeValue(BillToAttribute, null);
        client.setAttributeValue(JobTypeAttribute, null);
        client.setAttributeValue(JobSubTypeAttribute, null);
        client.setAttributeValue(SalesTerritoryAttribute, null);
        client.setAttributeValue(FieldOfficeAttribute, null);
    }
    else {
        Opportunity.changeOrderChecks();
    }
};

//filterJobSubTypeAttribute
Opportunity.filterJobSubTypeAttribute = function () {
    "use strict";
    try {
        var selectedJobType = client.getOptionSetText(JobTypeAttribute);

        if (!client.isNullOrUndefined(selectedJobType)) {

            let selectedJobSubTypeValue = client.getOptionSetValue(JobSubTypeAttribute);

            //Remove all options
            client.removeOptions(JobSubTypeAttribute);
            client.setAttributeValue(JobSubTypeAttribute, null);
            //Decide what to bring back
            if (selectedJobType === "Service") {
                client.addOptions(JobSubTypeAttribute, Opportunity.JobSubTypeForService);

                if (Opportunity.JobSubTypeForService.filter(e => e.value === selectedJobSubTypeValue).length > 0) {
                    client.setAttributeValue(JobSubTypeAttribute, selectedJobSubTypeValue);

                }

            }
            else if (selectedJobType === "Solutions") {
                client.addOptions(JobSubTypeAttribute, Opportunity.JobSubTypeForSolutions);
                if (Opportunity.JobSubTypeForSolutions.filter(e => e.value === selectedJobSubTypeValue).length > 0) {
                    client.setAttributeValue(JobSubTypeAttribute, selectedJobSubTypeValue);

                }
            }
        }
    } catch (e) {
        client.openErrorDialog("filterJobSubTypeAttribute : " + err, null, null);
    }
};

//removeTMJobSubType
Opportunity.removeTMJobSubType = function () {
    if (client.isFormTypeCreate()) {
        //Remove all options
        client.removeOptions(JobSubTypeAttribute);
        client.addOptions(JobSubTypeAttribute, Opportunity.JobSubTypeForService);
        client.addOptions(JobSubTypeAttribute, Opportunity.JobSubTypeForSolutions);
    }
};

//Task 95354
Opportunity.CloseAsWonLogic = function (arm_CrmParam) {
    var serviceAcc = client.getLookupId(ServiceAccountAttribute);
    var billingAcc = client.getLookupId(BillToAttribute);

    if (client.isNullOrUndefined(serviceAcc) || client.isNullOrUndefined(billingAcc))
        client.openErrorDialog("Service and Bill To Accounts must contain data.", function () { AlertDialogShown = false; }, null);
    else
        Mscrm.OpportunityCommandActions.opportunityClose(arm_CrmParam); //Function from //$webresource:Sales/Opportunity/Opportunity_main_system_library.js
};

Opportunity.IsRenewalShowHide = function () {
    let isRenewal = client.getAttributeValue(IsRenewalAttribute);

    if (!isRenewal) {
        client.setVisibility(PriorQuotesTotal, false);
        client.setVisibility(PriorQuotesTotalCostPrices, false);
        client.setVisibility(PriorGrossMargin, false);
        client.setVisibility(YoyQuotesTotalAmount, false);
        client.setVisibility(YoyQuotesTotalCostPrices, false);
        client.setVisibility(YoyGrossMargin, false);
    }
    else {
        client.setVisibility(PriorQuotesTotal, true);
        client.setVisibility(PriorQuotesTotalCostPrices, true);
        client.setVisibility(PriorGrossMargin, true);
        client.setVisibility(YoyQuotesTotalAmount, true);
        client.setVisibility(YoyQuotesTotalCostPrices, true);
        client.setVisibility(YoyGrossMargin, true);
    }
    //Added logic for Auto Renew
    var selectedJobType = client.getOptionSetText(JobTypeAttribute);
    var selectedJobSubType = client.getOptionSetText(JobSubTypeAttribute);
    if (selectedJobType == "Service" && selectedJobSubType == "Agreements") {
        var isContractApproved = (client.getAttribute(ContractApprovedAttribute) != null) ? client.getAttribute(ContractApprovedAttribute).getValue() : null;
        if (isContractApproved != null && isContractApproved) {
            client.setVisibility(AutoRenewAttribute, true);
            client.setDisabled(AutoRenewAttribute, true);
        }
        else {
            client.setVisibility(AutoRenewAttribute, true);
            client.setDisabled(AutoRenewAttribute, true);
        }
    }
    else {
        client.setVisibility(AutoRenewAttribute, false);
        client.setDisabled(AutoRenewAttribute, true);
    }
}

Opportunity.SetReadOnlyFieldsRenewalAfterCreation = function () {
    //let isRenewal = client.getAttributeValue(IsRenewalAttribute);
    ////check if isRenewal and if has id (after initial creation conditional)
    //setTimeout(() => {
    //    if (isRenewal != null && isRenewal && client.getId()) {
    //        client.setDisabled(IsRenewalAttribute, true);
    //        client.setDisabled(ParentOpportunityAttribute, true);
    //        client.setDisabled(ServiceAccountAttribute, true);
    //        client.setDisabled(BillToAttribute, true);
    //        client.setDisabled(JobTypeAttribute, true);
    //        client.setDisabled(JobSubTypeAttribute, true);
    //        client.setDisabled(FieldOfficeAttribute, true);
    //    }
    //}, 100)
}

Opportunity.SetAutoRenew = function () {
    var selectedJobType = client.getOptionSetText(JobTypeAttribute);
    var selectedJobSubType = client.getOptionSetText(JobSubTypeAttribute);
    if (selectedJobType == "Service" && selectedJobSubType == "Agreements") {
        if (client.isFormTypeCreate()) {
            client.setAttributeValue(AutoRenewAttribute, 858800001);
        }
    }
}