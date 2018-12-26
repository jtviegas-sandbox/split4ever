#!/bin/sh

this_folder=$(dirname $(readlink -f $0))
parent_folder=$(dirname $this_folder)

. $parent_folder/lib
. $parent_folder/include

input_file="$this_folder/data.in"

user1=tiago
user2=rocha
parts_maintenance_users="$user1 $user2"

parts_maintenance_group=s4e_parts_maintenance

role_assuming_policy_file=$this_folder/role_assuming.policy
#s3:ListBucketByTags,
parts_bucket_maintenance_actions="s3:GetBucketTagging,s3:ListBucketVersions,s3:GetBucketLogging,s3:CreateBucket,s3:ListBucket,s3:GetBucketPolicy,s3:DeleteBucketWebsite,s3:PutBucketTagging,s3:DeleteObject,s3:DeleteBucket,s3:PutBucketVersioning,s3:ListBucketMultipartUploads,s3:GetBucketVersioning,s3:PutBucketCORS,s3:GetBucketAcl,s3:GetBucketNotification,s3:PutObject,s3:PutBucketNotification,s3:PutBucketWebsite,s3:PutBucketRequestPayment,s3:PutBucketLogging,s3:GetBucketCORS,s3:GetBucketLocation,s3:ListAllMyBuckets,s3:HeadBucket,iam:ChangePassword"
parts_overall_maintenance_actions="s3:ListAllMyBuckets,s3:HeadBucket,iam:ChangePassword"
update_function_buckets_actions="s3:*"
update_function_tables_actions="dynamodb:*"
logs_policy_actions="logs:*"



__r=0

info "setting up identity and access management..."

info "...creating group for data maintenance users..."
createGroup $parts_maintenance_group
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...creating role for update function..."
createRole $UPDATE_FUNCTION_ROLE $role_assuming_policy_file
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...creating users..."
for u in $parts_maintenance_users; do
    createUser $u
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then return 1; fi
    addUserToGroup $u $parts_maintenance_group
    __r=$?
    if [ ! "$__r" -eq "0" ] ; then return 1; fi
done

info "...creating policies..."

logs_policy=$(buildPolicy "Allow" "$logs_policy_actions" "arn:aws:logs:*:*:*")
info "...policy: s4e_logs_policy..."
createPolicy s4e_logs_policy "$logs_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

parts_bucket_maintenance_policy=$(buildPolicy "Allow" "$parts_bucket_maintenance_actions" "arn:aws:s3:::*\/*")
info "...policy: s4e_parts_bucket_maintenance_policy..."
createPolicy s4e_parts_bucket_maintenance_policy "$parts_bucket_maintenance_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

parts_overall_maintenance_policy=$(buildPolicy "Allow" "$parts_overall_maintenance_actions" "*")
info "...policy: s4e_parts_overall_maintenance_policy..."
createPolicy s4e_parts_overall_maintenance_policy "$parts_overall_maintenance_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

update_function_buckets_policy=$(buildPolicy "Allow" "$update_function_buckets_actions" "arn:aws:s3:::$BUCKET_PARTS")
info "...policy: update_function_buckets_policy..."
createPolicy s4e_update_function_buckets_policy "$update_function_buckets_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

arn=`aws dynamodb describe-table --output text --table-name $TABLE_PARTS | grep arn.*$TABLE_PARTS | awk '{print $4}'`
arn=`echo $arn  | sed "s/\//\\//g"`

update_function_tables_policy=$(buildPolicy "Allow" "$update_function_tables_actions" "$arn")
info "...policy: s4e_update_function_tables_policy..."
createPolicy s4e_update_function_tables_policy "$update_function_tables_policy"
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi


info "...attaching policies to group..."

info "...attaching policy s4e_logs_policy to $parts_maintenance_group..."
attachPolicyToGroup s4e_logs_policy $parts_maintenance_group
info "...attaching policy s4e_parts_overall_maintenance_policy to $parts_maintenance_group..."
attachPolicyToGroup s4e_parts_overall_maintenance_policy $parts_maintenance_group
info "...attaching policy s4e_parts_overall_maintenance_policy to $parts_maintenance_group..."
attachPolicyToGroup s4e_parts_overall_maintenance_policy $parts_maintenance_group

info "...attaching update function role to policy s4e_logs_policy ..."
attachRoleToPolicy $UPDATE_FUNCTION_ROLE s4e_logs_policy
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...attaching update function role to policy s4e_update_function_buckets_policy ..."
attachRoleToPolicy $UPDATE_FUNCTION_ROLE s4e_update_function_buckets_policy
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi

info "...attaching update function role to policy s4e_update_function_tables_policy ..."
attachRoleToPolicy $UPDATE_FUNCTION_ROLE s4e_update_function_tables_policy
__r=$?
if [ ! "$__r" -eq "0" ] ; then return 1; fi



info "...identity and access management setup done."