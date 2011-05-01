class AnnotationsController < ApplicationController

  before_filter      :authorize_for_ta_and_admin, :except => :view_image_annotations
  layout "empty_svg.svg",   :only => [:view_image_annotations]

  # Not possible to do with image annotations.
  def add_existing_annotation
    return unless request.post?
    @text = AnnotationText.find(params[:annotation_text_id])
    @submission_file_id = params[:submission_file_id]
    @submission_file = SubmissionFile.find(@submission_file_id)
    submission= @submission_file.submission
    @annotation = TextAnnotation.new
    @annotation.update_attributes({
      :line_start => params[:line_start],
      :line_end => params[:line_end],
      :submission_file_id => params[:submission_file_id],
      :annotation_number => submission.annotations.count + 1
    })
    @annotation.annotation_text = @text
    @annotation.save
    @submission = @submission_file.submission
    @annotations = @submission.annotations
  end

  def create
    return unless request.post?
    @text = AnnotationText.create({
      :content => params[:content],
      :annotation_category_id => params[:category_id]
    })
    @submission_file_id = params[:submission_file_id]
    @submission_file = SubmissionFile.find(@submission_file_id)
    submission= @submission_file.submission
    case params[:annotation_type]
      when 'text'
        @annotation = TextAnnotation.create({
          :line_start => params[:line_start],
          :line_end => params[:line_end],
          :annotation_text_id => @text.id,
          :submission_file_id => params[:submission_file_id],
          :annotation_number => submission.annotations.count + 1
        })
      when 'image'
        @annotation = AreaAnnotation.create({
          :annotation_text_id => @text.id,
          :submission_file_id => params[:submission_file_id],
          :x1 => Integer(params[:x1]), :x2 => Integer(params[:x2]),
          :y1 => Integer(params[:y1]), :y2 => Integer(params[:y2]),
          :annotation_number => submission.annotations.count + 1
        })
    end
    @submission = @submission_file.submission
    @annotations = @submission.annotations
  end

  def destroy
    return unless request.post?
    @annotation = Annotation.find(params[:id])
    @old_annotation = @annotation.destroy
    @submission_file_id = params[:submission_file_id]
    @submission_file = SubmissionFile.find(@submission_file_id)
    @submission = @submission_file.submission
    @annotations = @submission.annotations
    @annotations.each do |annot|
      if annot.annotation_number > @old_annotation.annotation_number
        annot.annotation_number -= 1
        annot.save
      end
    end
  end

  def update_annotation
    return unless request.post?
    @content = params[:annotation_text][:content]
    @id = params[:annotation_text][:id]
    @submission_file_id = params[:annotation_text][:submission_file_id]
    @annotation_text = AnnotationText.find(@id)
    @annotation_text.content = @content
    @annotation_text.save
    @submission_file = SubmissionFile.find(@submission_file_id)
    @submission = @submission_file.submission
    @annotations = @submission.annotations
  end

  #Updates the overall comment from the annotations tab
  def update_comment
    return unless request.post?
    result = Result.find(params[:result_id])
    result.overall_comment = params[:overall_comment]
    result.save;
    render :update do |page|
    end
  end

  #Retrieves the annotations associated to an image
  def view_image_annotations
    return unless request.get?
    @submission_file = SubmissionFile.find(params[:submission_file_id])
    submission = Submission.find_by_id(@submission_file.submission_id)
    grouping = Grouping.find_by_id(submission.grouping_id)

    #Catch assignment's categories
    assignment = submission.assignment
    @annotation_categories = assignment.annotation_categories
    begin
      @size = ImageSize.new(open(File.join(MarkusConfigurator.markus_config_pdf_storage, @submission_file.submission.grouping.group.repository_name, @submission_file.path, @submission_file.filename)).read).size if @submission_file.is_supported_image?
      @size = ImageSize.new(open(File.join(MarkusConfigurator.markus_config_pdf_storage, @submission_file.submission.grouping.group.repository_name, @submission_file.path, @submission_file.filename.split('.').first, '.jpg')).read).size if @submission_file.is_pdf?
    rescue Errno::ENOENT
      raise "File #{@submission_file.filename} in #{File.join(MarkusConfigurator.markus_config_pdf_storage, @submission_file.submission.grouping.group.repository_name, @submission_file.path)} not found - Are you using SQLite3 as database" if @submission_file.is_pdf?
      raise "File #{@submission_file.filename.split('.').first}.jpg in #{File.join(MarkusConfigurator.markus_config_pdf_storage, @submission_file.submission.grouping.group.repository_name, @submission_file.path)} not found - Are you using SQLite3 as database" if @submission_file.is_supported_image?
    end
    if grouping.ensure_can_see?(current_user)
      @annotations = @submission_file.annotations
      render 'annotations/svg_annotations/annotations.svg.erb'
    else
      render :file => "#{RAILS_ROOT}/public/404.html",
         :status => 404
    end
  end

  def write_annotations
    return unless request.post?
    # Parse the JSON send to the controller
    res = ActiveSupport::JSON.decode(params[:annotations])
    db_ids = {"shapes" => {}, "areas" => {}}
    # Create an AnnotationText
    if res.has_key?("annotation_text")
      text = AnnotationText.create({
        :content => res["annotation_text"],
      })
      text.save
    elsif res.has_key?("annotation_category_id")
      text = AnnotationText.create({
        :annotation_category_id => res["annotation_category_id"]
      })
      text.save
    end
    res["areas"].each do |area|
      a = AreaAnnotation.create({
        :thickness => area["thickness"],
        :color => area["color"],
        :x1 => area["points"]["left"],
        :x2 => area["points"]["right"],
        :y1 => area["points"]["top"],
        :y2 => area["points"]["bottom"],
        :annotation_text_id => text.id,
        :submission_file_id => params[:submission_file_id].to_i,
        :annotation_number => 1
      })
      a.save
      unless a.id.nil?
        db_ids["areas"][area["localId"]] = a.id
      end
    end

    res["shapes"].each do |shape|
      a = ShapeAnnotation.create({
        :thickness => shape["thickness"],
        :color => shape["color"],
        :annotation_text_id => text.id,
        :submission_file_id => params[:submission_file_id].to_i,
        :annotation_number => 1
      })
      a.save
      unless a.id.nil?
        order = 0
        shape["points"].each do |point|
          p = Point.create({
            :coord_x => point["x"],
            :coord_y => point["y"],
            :order => order,
            :shape_annotation_id => a.id
          })
          p.save
          order += 1
        end
        db_ids["shapes"][shape["localId"]] = a.id
      end
    end

    render :json => db_ids

  end

  def delete_annotation
    return unless request.post?
    if params.has_key? :shape_id
      @annotation = ShapeAnnotation.find(params[:shape_id])
      if !@annotation.nil?
        @points = @annotation.points
        @points.each do |point|
          point.destroy
        end
      end
    elsif params.has_key? :area_id
      @annotation = AreaAnnotation.find(params[:area_id])
    end

    if !@annotation.nil?
      @text = @annotation.annotation_text
      @area_sibling = AreaAnnotation.first(:conditions =>  ["annotation_text_id = ?", @text.id])
      @shape_sibling = ShapeAnnotation.first(:conditions =>  ["annotation_text_id = ?", @text.id])
      if @area_sibling.nil? and @shape_sibling.nil?
        @text.destroy
      end
      @old_annotation = @annotation.destroy
      @submission_file_id = params[:submission_file_id]
      @submission_file = SubmissionFile.find(@submission_file_id)
      @submission = @submission_file.submission
      @annotations = @submission.annotations
      @annotations.each do |annot|
        if annot.annotation_number > @old_annotation.annotation_number
          annot.annotation_number -= 1
          annot.save
        end
      end
    end

    render :json => {"ok" => 1}

  end

end
