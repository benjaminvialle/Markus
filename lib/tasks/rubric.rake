namespace :db do

  desc 'Create Rubric for assignments'
  task :rubric => :environment do
    puts 'Add Rubric To Assignments'
    require 'faker'
    I18n.reload!

    def pos_rand(range)
      rand(range) + 1
    end

    def random_words(range)
      Faker::Lorem.words(pos_rand(range)).join(' ')
    end

    def random_sentences(range)
      Faker::Lorem.sentence(pos_rand(range))
    end


    Assignment.all.each do |assignment|
      8.times do |index|
        if assignment.marking_scheme_type == Assignment::MARKING_SCHEME_TYPE[:rubric]
          RubricCriterion.create(
            name:                  random_sentences(1),
            assignment_id:         assignment.id,
            position:              1,
            max_mark:              pos_rand(3),
            level_0_name:          random_words(5),
            level_0_description:   random_sentences(5),
            level_1_name:          random_words(5),
            level_1_description:   random_sentences(5),
            level_2_name:          random_words(5),
            level_2_description:   random_sentences(5),
            level_3_name:          random_words(5),
            level_3_description:   random_sentences(5),
            level_4_name:          random_words(5),
            level_4_description:   random_sentences(5)
          )
        elsif assignment.marking_scheme_type == Assignment::MARKING_SCHEME_TYPE[:flexible]
          FlexibleCriterion.create(
            name:                    random_sentences(1),
            assignment_id:           assignment.id,
            description:             random_sentences(5),
            position:                1,
            max_mark:                pos_rand(3),
            created_at:              nil,
            updated_at:              nil,
            assigned_groups_count:   nil
          )
        end
      end

      5.times do |index|
        ac = AnnotationCategory.create(assignment: assignment,
                                       position: 1,
                                       annotation_category_name: random_words(3))

        (rand(10) + 3).times do
          AnnotationText.create(annotation_category: ac, content: random_sentences(3))
        end
      end
    end
  end
end
