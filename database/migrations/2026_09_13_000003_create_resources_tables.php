<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('resource_type', 30)->index();
            $table->foreignId('university_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('college_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('semester_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 20)->default('draft')->index();
            $table->boolean('featured')->default(false)->index();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('bookmarks_count')->default(0);
            $table->unsignedBigInteger('downloads_count')->default(0);
            $table->timestamp('published_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('university_id');
            $table->index('college_id');
            $table->index('program_id');
            $table->index('semester_id');
            $table->index('subject_id');
            $table->index('unit_id');
            $table->index('topic_id');
        });

        Schema::create('resource_tags', function (Blueprint $table) {
            $table->foreignId('resource_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['resource_id', 'tag_id']);
        });

        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('cover_image')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('file_mime', 100)->nullable();
            $table->string('author')->nullable();
            $table->json('toc')->nullable();
            $table->integer('pages')->nullable();
            $table->timestamps();
        });

        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('thumbnail')->nullable();
            $table->string('video_url')->nullable();
            $table->string('video_path')->nullable();
            $table->string('video_type', 20)->default('url');
            $table->string('provider', 30)->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->integer('views')->default(0);
            $table->timestamps();
        });

        Schema::create('literature', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('category', 50)->index();
            $table->string('author')->nullable();
            $table->string('organization')->nullable();
            $table->integer('year')->nullable();
            $table->string('file_path')->nullable();
            $table->string('external_url')->nullable();
            $table->string('cover_image')->nullable();
            $table->timestamps();
        });

        Schema::create('previous_papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->unique()->constrained()->cascadeOnDelete();
            $table->integer('year')->index();
            $table->string('exam_type', 50)->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->string('answer_key_path')->nullable();
            $table->boolean('has_answer_key')->default(false);
            $table->timestamps();
        });

        Schema::create('practical_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('practical_type', 50)->index();
            $table->string('resource_path')->nullable();
            $table->string('thumbnail')->nullable();
            $table->json('steps')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practical_resources');
        Schema::dropIfExists('previous_papers');
        Schema::dropIfExists('literature');
        Schema::dropIfExists('videos');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('resource_tags');
        Schema::dropIfExists('resources');
    }
};