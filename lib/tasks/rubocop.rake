task test: :rubocop

desc 'RuboCop is a Ruby code style checker based on the Ruby Style Guide.'
task :rubocop do
  sh 'rubocop'
end
