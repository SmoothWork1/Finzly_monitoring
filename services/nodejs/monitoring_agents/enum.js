const queries_identifier = {
    FAILED_MESSAGES: "rt_messaging",
    FAILED_ACH_ELEMENTS: "failed_ach_elements",
    FAILED_RTP: "failed_rtp",
    PAYMENT_FAILURE_LMDA:"payment_failure",
    FAILED_PAYMENTS: "failed_payments",
    FAILED_FEES: "failed_fees",
    FAILED_FEDWIRE: "failed_fedwire",
    FAILED_ACH:"failed_ach",
    DUPLICATE_FEDWIRE_PAYMENTS:"duplicate_fedwire_payments",
    DUPLICATE_FEDWIRE_MSGS:"duplicate_fedwire_msgs",
    DUPLICATE_PAYMENTS:"duplicate_payments",
    CHECK_PAYMENTS: "check_payments",
    STUCK_FUTURE_PAYMENTS: "stuck_future_payments",
    STUCK_PAYMENTS: "stuck_payments",
    CHECK_FEDWIRE: "check_fedwire",
    CHECK_ACH: "check_ach",
    FAILED_ACH_TRANSACTIONS:"failed_ach_transactions",
    FAILED_BULK_FILES:"failed_bulk_files",
    FAILED_ACH_FILES:"failed_ach_files",
    FAILED_NOC_RECORDS:"failed_noc_records",
    FAILED_RETURN_RECORDS:"failed_return_records",
    FAILED_ACH_BATCH:"failed_ach_batch",
    STATICDATA_MONITOR: "staticdata-monitor-scheduler",
    SYSTEMDATE_MONITOR: "systemdate-monitor-scheduler",
    STUCK_NOTIFICATIONS: "stuck-notifications-scheduler"
};
  
module.exports = {
    queries_identifier
}