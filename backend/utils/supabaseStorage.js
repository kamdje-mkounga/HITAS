const path = require("path");
const supabase = require("../config/supabase");

const uploadFile = async (file, folder) => {
    const extension = path.extname(file.originalname);

    const fileName =
        `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    const { error } = await supabase.storage
        .from("media")
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        throw error;
    }

    const { data } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

    return {
        url: data.publicUrl,
        path: fileName
    };
};

const deleteFile = async (filePath) => {
    if (!filePath) return;

    const { error } = await supabase.storage
        .from("media")
        .remove([filePath]);

    if (error) {
        console.error("Supabase delete error:", error.message);
    }
};

module.exports = {
    uploadFile,
    deleteFile
};