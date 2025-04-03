import { AppBar } from "../components/AppBar";
import { BlogCard } from "../components/BlogCard";
import { Skeleton } from "../components/Skeleton";
import { useBlogs } from "../hooks";

export const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return <div>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
        </div>;
    }

    // Sort blogs by id using string-based sorting
    // const sortedBlogs = (blogs || []).sort((a, b) => b.id.localeCompare(a.id));

    return (
        <div>
            <AppBar />
            <div className="flex justify-center">
                <div>
                    {blogs.map(blog => (
                        <BlogCard
                            key={blog.id} // Adding a unique key is important for React
                            id={blog.id}
                            publishedDate={"2021-09-01"}
                            authorName={blog.author?.name || "Anonymous"}
                            title={blog.title}
                            content={blog.content}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
