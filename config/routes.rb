# Required for filtering locale prefixed requests
require 'routing_filter'

Markus::Application.routes.draw do
  filter :locale

  # Install the default routes as the lowest priority.
  root :controller => "main", :action => "login"
   # API routes
  namespace :api do
    resources :test_results
    resources :submission_downloads
    resources :users
  end

  resources :admins do
    collection do
      post 'populate'
    end
  end

  resources :annotations do
    member do
      post 'update_comment'
    end
  end

  resources :assignments do

    collection do
      get 'download_csv_grades_report'
      get 'update_group_properties_on_persist'
    end

    member do
      get 'refresh_graph'
      get 'student_interface'
      get 'update_group_properties_on_persist'
      get 'invite_member'
      get 'creategroup'
    end

    resources :rubrics do
      collection do
        get 'update_positions'
        get 'csv_upload'
        get 'yml_upload'
        get 'download_csv'
        get 'download_yml'
        get 'move_criterion'
      end
    end

    resources :flexible_criteria
    resources :test_framework do
      collection do
        get 'manage'
      end
    end

    resources :groups do
      collection do
        post 'populate'
        post 'populate_students'
        get 'add_group'
        get 'use_another_assignment_groups'
        get 'manage'
        get 'csv_upload'
        get 'add_csv_group'
        get 'download_grouplist'
        get 'create_groups_when_students_work_alone'
        get 'valid_grouping'
        get 'invalid_grouping'
        get 'global_actions'
        get 'remove_group'
        get 'rename_group'
        post 'add_group'
        post 'global_actions'
      end
    end

    resources :submissions do
      collection do
        get 'file_manager'
        get 'browse'
        post 'populate_file_manager'
        get 'collect_all_submissions'
        get 'download_simple_csv_report'
        get 'download_detailed_csv_report'
        get 'download_svn_export_list'
        get 'download_svn_export_commands'
        get 'download_svn_repo_list'
        get 'collect_ta_submissions'
        get 'update_submissions'
        post 'populate_repo_browser'
        get 'update_converted_pdfs'
        get 'updated_files'
        post 'updated_files'
        get 'server_time'
      end

      member do
        get 'collect_and_begin_grading'
        get 'repo_browser'
      end

      resources :results do
        collection do
          get 'update_mark'
          get 'add_extra_mark'
        end

        member do
          get 'download'
          get 'next_grouping'
          get 'remove_extra_mark'
          get 'expand_unmarked_criteria'
          get 'update_overall_remark_comment'
        end
      end
    end

    resources :graders do
      collection do
        get 'add_grader_to_grouping'
        get 'csv_upload_grader_groups_mapping'
        post 'csv_upload_grader_criteria_mapping'
        get 'download_dialog'
        get 'download_grouplist'
        get 'grader_criteria_dialog'
        get 'global_actions'
        get 'groups_coverage_dialog'
        post 'populate_graders'
        post 'populate'
        post 'populate_criteria'
        get 'set_assign_criteria'
        get 'random_assign'
        get 'upload_dialog'
        get 'unassign'
        post 'global_actions'
      end
    end

    resources :annotation_categories do
      collection do
        get 'get_annotations'
        get 'add_annotation_category'
        get 'add_annotation_text'
        get 'csv_upload'
        get 'delete_annotation_category'
        get 'download'
        get 'yml_upload'
        post 'delete_annotation_text'
        post 'update_annotation_category'
        post 'update_annotation'
      end
    end

    resources :flexible_criteria
  end

  resources :grade_entry_forms do
    collection do
      post 'student_interface'
    end

    member do
      get 'grades'
      get 'g_table_paginate'
      get 'csv_download'
      get 'csv_upload'
      post 'update_grade'
      post 'student_interface'
      post 'update_grade_entry_students'
    end
  end

  resources :notes do
    collection do
      post 'noteable_object_selector'
      get 'add_note'
      get 'new_update_groupings'
      post 'new_update_groupings'
    end

    member do
      get 'student_interface'
      get 'notes_dialog'
      post 'grades'
    end
  end

  resources :rubric

  resources :sections

  resources :students do
    collection do
      post 'populate'
      get 'manage'
      get 'download_student_list'
      get 'upload_student_list'
    end
  end

  resources :tas  do
    collection do
      post 'populate'
      get 'upload_ta_list'
      get 'download_ta_list'
    end
  end

  resources :main do
    collection do
      get 'logout'
      get 'about'
      get 'login_as'
      get 'clear_role_switch_session'
    end
  end

  match 'main', :controller => 'main', :action => 'index'
  match 'main/about', :controller => 'main', :action => 'about'
  match 'main/logout', :controller => 'main', :action => 'logout'


  # Return a 404 when no route is match
  match '*path', :controller => 'main', :action => 'page_not_found'
end
