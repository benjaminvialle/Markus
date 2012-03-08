require File.join(File.dirname(__FILE__), '..', 'test_helper')
require File.join(File.dirname(__FILE__), '..', 'blueprints', 'helper')

require 'shoulda'
require 'machinist'
require 'mocha'



class GroupingTest < ActiveSupport::TestCase

  should belong_to :grouping_queue
  should belong_to :group
  should belong_to :assignment
  should have_many :memberships
  should have_many :submissions
  should have_many :notes

  setup do
    clear_fixtures
  end

  context "A good grouping model" do
    setup do
      @grouping = Grouping.make
    end

    should validate_presence_of :group_id
    should validate_presence_of :assignment_id
  end

  context "A grouping" do
    setup do
      @grouping = Grouping.make
    end

    should "not have any ta for marking" do
      assert !@grouping.has_ta_for_marking?
    end

    should "not have submissions" do
      assert !@grouping.has_submission?
    end

    should "can't invite nor add hidden students" do
      hidden = Student.make(:hidden => true)
      @grouping.invite(hidden.user_name)
      assert_equal 0, @grouping.memberships.count

      @grouping.add_member(hidden)
      assert_equal 0, @grouping.memberships.count
    end

    should "be able to report the last modified date of the assignment_folder" do
      last_modified = @grouping.assignment_folder_last_modified_date
      assert_not_nil(last_modified)
      assert_instance_of(Time, last_modified)
      # This is not exactly accurate, but it's sufficient
      # FIXME actually, it sometimes isn't sufficient...
      assert_equal(Time.now.min, last_modified.min)
    end

    should "display Empty Group since no students in the group" do
      assert_equal "Empty Group", @grouping.get_all_students_in_group
    end

    context "and two unassigned tas" do
      setup do
        @ta2 = Ta.make
        @ta1 = Ta.make
      end

      should "be able to add ta" do
        @grouping.add_tas(@ta1)

      end

      should "be able to add tas using an array" do
        user_name_array = [@ta1.user_name, @ta2.user_name]
        assert_equal 0, @grouping.ta_memberships.count
        @grouping.add_tas_by_user_name_array(user_name_array)
        assert_equal 2, @grouping.ta_memberships.count
      end
    end

    context "with two student members" do
      setup do
        # should consist of inviter and another student
        @membership = StudentMembership.make(:user => Student.make(:user_name => "student1"),
          :grouping => @grouping,
          :membership_status => StudentMembership::STATUSES[:accepted])

        @inviter_membership = StudentMembership.make(:user => Student.make(:user_name => "student2"),
          :grouping => @grouping,
          :membership_status => StudentMembership::STATUSES[:inviter])
        @inviter = @inviter_membership.user

      end

      should "display for note without seeing an exception" do
        assert_nothing_raised do
          @grouping.display_for_note
        end
      end

      should "display group name and students' usernames" do
        assert_nothing_raised do
          @grouping.group_name_with_student_user_names
        end
      end

  should "display comma separated list of students' usernames" do
    assert_equal "student1, student2", @grouping.get_all_students_in_group
  end

      should "be valid" do
        assert_equal @grouping.student_membership_number, 2
        assert @grouping.valid?, "This grouping has the right amount of
        memberships. It should be valid"
      end

      should "return membership status are part of the group" do
        student = Student.make
        assert_nil @grouping.membership_status(student)
        assert_equal 'accepted',
                     @grouping.membership_status(@membership.user)
        assert_equal 'inviter',
                     @grouping.membership_status(@inviter)

      end

      should "detect pending members" do
        assert !@grouping.pending?(@inviter)
      end

      should "detect the inviter" do
        assert !@grouping.is_inviter?(@membership.user)
        assert @grouping.is_inviter?(@inviter)
      end

      should "be able to remove a member" do
        @grouping.remove_member(@membership)
        assert_nil @grouping.membership_status(@membership.user),
                   "This student has just been deleted from this group. His
                   membership status should be nil"
      end

      should "be able to remove the inviter" do
        @grouping.remove_member(@inviter_membership)
        assert_nil @grouping.membership_status(@inviter)
        assert_not_nil @grouping.inviter
      end

      should "be able to report if the grouping is deletable" do

        non_inviter = @membership.user
        # delete member to have it deletable
        @grouping.remove_member(@membership.id)
        @grouping.reload
        assert_equal(1, @grouping.accepted_students.size)
        # inviter should be able to delete grouping
        assert(@grouping.deletable_by?(@inviter))
        # non-inviter shouldn't be able to delete grouping
        if non_inviter.nil?
          raise "No members in this grouping other than the inviter!"
        end
        assert(!@grouping.deletable_by?(non_inviter))
      end

    end

    context "with a pending membership" do
      setup do
        @student = StudentMembership.make(
          :grouping => @grouping,
          :membership_status => StudentMembership::STATUSES[:pending]).user
      end

     should "detect pending members" do
        assert @grouping.pending?(@student)
      end

      should "return correct membership status" do
        assert_equal "pending", @grouping.membership_status(@student)
      end

      should "be able to decline invitation" do
        @grouping.decline_invitation(@student)
        assert !@grouping.pending?(@student)
      end
    end

    context "with a rejected membership" do
      setup do
        @membership = StudentMembership.make(
          :grouping => @grouping,
          :membership_status => StudentMembership::STATUSES[:rejected])
        @student = @membership.user
      end

      should "return correct membership status" do
        assert_equal "rejected", @grouping.membership_status(@student)
      end

      should "be able to delete rejected memberships" do
        @grouping.remove_rejected(@membership)
        assert_nil @grouping.membership_status(@student)
      end
    end

    context "with a ta assigned to grade" do
      setup do
        @membership = TaMembership.make(
          :grouping => @grouping)
        @ta = @membership.user
      end

      should "have a ta for marking" do
        assert @grouping.has_ta_for_marking?
      end

      should "get ta names" do
        assert_equal @ta.user_name,
                     @grouping.get_ta_names[0]
      end

      should "not be able to assign same ta twice" do
        assert_equal 1, @grouping.ta_memberships.count
        @grouping.add_tas(@ta)
        assert_equal 1, @grouping.ta_memberships.count
      end

      should "be able to remove ta" do
        @grouping.remove_tas(@ta)
        assert_equal 0, @grouping.ta_memberships.count

      end

    end


    context "with some submitted files" do

      # submit files
      setup do
        @assignment = Assignment.make
        @file = AssignmentFile.make(:assignment => @assignment)
        @grouping = Grouping.make(:assignment => @assignment)
        @grouping.group.access_repo do |repo|
          txn = repo.get_transaction("markus")
          assignment_folder = File.join(@assignment.repository_folder, File::SEPARATOR)
          begin
            txn.add(File.join(assignment_folder,
                              "Shapes.java"),
                    "shapes content",
                    "text/plain")
            if !repo.commit(txn)
              raise "Unable to setup test!"
            end
          rescue Exception => e
            raise "Test setup failed: " + e.message
          end
        end
      end

      teardown do
        destroy_repos
      end

      should "be able to report the number of files submitted" do
        assert @grouping.number_of_submitted_files > 0
      end

      should "report that grouping is not deleteable" do
        StudentMembership.make(
            :grouping => @grouping,
            :membership_status => StudentMembership::STATUSES[:inviter])
        StudentMembership.make(
            :grouping => @grouping,
            :membership_status => StudentMembership::STATUSES[:accepted])

        assert !@grouping.deletable_by?(@grouping.inviter)
      end

      should "be able to report the still missing required assignment_files" do
        missing_files = @grouping.missing_assignment_files
        assert_equal(1, missing_files.length)
        assert_equal([@file], missing_files)
        # submit another file so that we have all required files submitted
        @grouping.group.access_repo do |repo|
          txn = repo.get_transaction("markus")
          begin
            txn.add(File.join(@assignment.repository_folder,
                              @file.filename),
                    "ShapesTest content",
                    "text/plain")
            if !repo.commit(txn)
              raise "Commit failed!"
            end
          rescue Exception => e
            raise "Submitting file failed: " + e.message
          end
          # check again; there shouldn't be any missing files anymore
          missing_files = @grouping.missing_assignment_files
          assert_equal(0, missing_files.length)
        end
      end

    end # end files submitted context


    context "calling has_submission? with many submissions, all with submission_version_used == false" do
      setup do
        @grouping = Grouping.make
        @submission1 = Submission.make(:submission_version_used => false,
                                       :grouping => @grouping)
        @submission2 = Submission.make(:submission_version_used => false,
                                       :grouping => @grouping)
        @submission3 = Submission.make(:submission_version_used => false,
                                       :grouping => @grouping)
        @grouping.reload
      end

      should "behave like theres no submission and return false" do
        #sort only to ensure same order of arrays
        assert_equal [@submission1, @submission2, @submission3].sort{|a,b| a.id <=> b.id},
          @grouping.submissions.sort{|a,b| a.id <=> b.id}
        assert_nil @grouping.current_submission_used
        assert !@grouping.has_submission?
      end
    end

    #The order in which submissions are added to the grouping matters because
    #after a submission is created, it ensures that all other submissions have
    #submission_version_used set to false.
    context "calling has_submission? with many submissions, with the last submission added to the grouping having submission_version_used == false" do
      setup do
        @grouping = Grouping.make
        @submission1 = Submission.make(:submission_version_used => true, :grouping => @grouping)
        @submission2 = Submission.make(:submission_version_used => false, :grouping => @grouping)
        @submission3 = Submission.make(:submission_version_used => true, :grouping => @grouping)
        @submission4 = Submission.make(:submission_version_used => false, :grouping => @grouping)
        @grouping.reload
      end
      should "behave like there is no submission" do
        #sort only to ensure same order of arrays
        assert_equal [@submission1, @submission2, @submission3, @submission4].sort{|a,b| a.id <=> b.id},
          @grouping.submissions.sort{|a,b| a.id <=> b.id}
        assert_nil @grouping.current_submission_used
        assert !@grouping.has_submission?
      end
    end

    context "calling has_submission? with many submissions, with the last submission added to the grouping having submission_version_used == true" do
      setup do
        @grouping = Grouping.make
        @submission1 = Submission.make(:submission_version_used => false, :grouping => @grouping)
        @submission2 = Submission.make(:submission_version_used => true, :grouping => @grouping)
        @submission3 = Submission.make(:submission_version_used => true, :grouping => @grouping)
        @grouping.reload
      end

      should "behave like there is a submission" do
        #sort only to ensure same order of arrays
        assert_equal [@submission1, @submission2, @submission3].sort{|a,b| a.id <=> b.id},
          @grouping.submissions.sort{|a,b| a.id <=> b.id}
        assert !@submission2.reload.submission_version_used
        assert_equal @submission3, @grouping.current_submission_used
        assert @grouping.has_submission?
      end
    end

    context "containing multiple submissions with submission_version_used == true" do
      setup do
        @grouping = Grouping.make
        #Dont use machinist in order to bypass validation
        @submission1 = @grouping.submissions.build(:submission_version_used => false,
          :revision_number => 1, :revision_timestamp => 1.days.ago, :submission_version => 1)
        @submission1.save(:validate => false)
        @submission2 = @grouping.submissions.build(:submission_version_used => true,
          :revision_number => 1, :revision_timestamp => 1.days.ago, :submission_version => 2)
        @submission2.save(:validate => false)
        @submission3 = @grouping.submissions.build(:submission_version_used => true,
          :revision_number => 1, :revision_timestamp => 1.days.ago, :submission_version => 3)
        @submission3.save(:validate => false)
        @grouping.reload
      end

      should "set all the submissions' submission_version_used columns to false upon creation of a new submission" do
        #sort only to ensure same order of arrays
        assert_equal [@submission1, @submission2, @submission3].sort{|a,b| a.id <=> b.id},
          @grouping.submissions.sort{|a,b| a.id <=> b.id}
        assert @grouping.has_submission?
        #Make sure current_submission_used returns a single Submission, not an array
        assert @grouping.current_submission_used.is_a?(Submission)
        @submission4 = Submission.make(:submission_version_used => false, :grouping => @grouping)
        @grouping.reload
        assert !@grouping.has_submission?
        assert_equal 4, @submission4.submission_version
        @submission5 = Submission.make(:submission_version_used => true, :grouping => @grouping)
        @grouping.reload
        assert @grouping.has_submission?
        assert_equal @submission5, @grouping.current_submission_used
      end
    end

    context "containing a user" do
      setup do 
        clear_fixtures
        @grouping = Grouping.make
        @submission = Submission.make(:grouping => @grouping)
        @student = Student.make
        @membership = StudentMembership.make(:grouping => @grouping,:user => @student)
      end
      should " allow him to see the file" do
        assert @grouping.ensure_submission_visible?(@student)
      end
    end
    
    context "rejecting a membership" do
      setup do 
        clear_fixtures
        @grouping = Grouping.make
        @submission = Submission.make(:grouping => @grouping)
        @student = Student.make
        @membership = StudentMembership.make(:grouping => @grouping,:user => @student, :membership_status => StudentMembership::STATUSES[:rejected])
      end
      should "not allow it's members to see the submission file" do
        assert  !@grouping.ensure_submission_visible?(@student)
      end
    end

    context "submitting a file" do
      setup do
        clear_fixtures
        @grouping = Grouping.make
	@submission = Submission.make(:grouping => @grouping)
        @membership = StudentMembership.make(:grouping => @grouping)
	@admin = Admin.make
      end
      should "allow the admin to see the submission file" do
        assert @grouping.ensure_submission_visible?(@admin)
      end
    end

    context "matching with a grader" do
      setup do 
        clear_fixtures
        @grouping = Grouping.make
        @submission = Submission.make(:grouping => @grouping)
        @membership = StudentMembership.make(:grouping => @grouping)
	@ta = Ta.make
	@tamembership = TaMembership.make(:grouping => @grouping,:user => @ta,:membership_status => 'accepted')
      end
      should " allow it's grader to see the submission file" do
        assert @grouping.ensure_submission_visible?(@ta)
      end
    end

    context "rejecting a grader" do
      setup do 
        clear_fixtures
        @grouping = Grouping.make
        @submission = Submission.make(:grouping => @grouping)
        @membership = StudentMembership.make(:grouping => @grouping)
	@ta = Ta.make
	@tamembership = TaMembership.make(:grouping => @grouping,:user => @ta,:membership_status => 'rejected')
      end
      should " not allow this grader to see the submission file" do
        assert !@grouping.ensure_submission_visible?(@ta)
      end
    end


  end
  # end grouping context

  context "A grouping without students (ie created by an admin)" do
    setup do
      @grouping = Grouping.make
      @student_01 = Student.make
      @student_02 = Student.make
    end

    should "accept to add students in any scenario possible when invoked by
            admin" do
      members = [@student_01.user_name, @student_02.user_name]
      @grouping.invite(members,
                       StudentMembership::STATUSES[:accepted],
                       true)
      assert_equal 2, @grouping.accepted_student_memberships.count
    end
  end

  context "A grouping without students (ie created by an admin) for a
           assignment with section restriction" do
    setup do
      @assignment = Assignment.make(:section_due_dates_true)
      @grouping = Grouping.make(:assignment => @assignment)
      section_01 = Section.make
      section_02 = Section.make
      @student_01 = Student.make(:section => section_01)
      @student_02 = Student.make(:section => section_02)
    end

    should "accept to add students to groups without checking their sections" do
      members = [@student_01.user_name, @student_02.user_name]
      @grouping.invite(members,
                       StudentMembership::STATUSES[:accepted],
                       true)
      assert_equal 2, @grouping.accepted_student_memberships.count
    end
  end

  context "an assignment with three named groupings" do
    setup do
      @assignment = Assignment.make
      Ta.make(:user_name => 'ta1')
      Ta.make(:user_name => 'ta2')
      grouping = nil
      ['Titanic', 'Blanche Nef', 'Ukishima Maru'].each do |name|
        group = Group.make(:group_name => name)
        @grouping = Grouping.make(:assignment => @assignment,
                      :group => group)
      end
    end

    should "load csv file" do
      csv_file_data =
'''Titanic,ta1
Ukishima Maru,ta1,ta2
Blanche Nef,ta2'''
      failures = Grouping.assign_tas_by_csv(csv_file_data, @assignment.id, nil)

      # This should be +1 ta_memberships, because one of those TAs is already
      # assigned to Ukishima Maru in the fixtures
      assert_equal 2, @grouping.ta_memberships.count
      assert_equal 0, failures.size
    end

    should "deal with malformed csv file" do
      csv_file_data = '''Titanic,ta1
Uk125125ishima Maru,ta1,ta2
Blanche Nef,ta2'''
      failures = Grouping.assign_tas_by_csv(csv_file_data, @assignment.id, nil)

      assert_equal 0, @grouping.ta_memberships.count
      assert_equal failures[0], "Uk125125ishima Maru"
    end
  end

  context "A grouping with students in section" do
    setup do
      @section = Section.make
      student  = Student.make(:section => @section)
      @student_can_invite = Student.make(:section => @section)
      @student_cannot_invite = Student.make

      assignment = Assignment.make(:section_groups_only => true)
      @grouping = Grouping.make(:assignment => assignment)
      StudentMembership.make(:user => student,
              :grouping => @grouping,
              :membership_status => StudentMembership::STATUSES[:inviter])
    end

    should "return true to can invite for students of same section" do
      assert @grouping.can_invite?(@student_can_invite)
    end

    should "return false to can invite for students of different section" do
      assert !@grouping.can_invite?(@student_cannot_invite)
    end
  end
end
