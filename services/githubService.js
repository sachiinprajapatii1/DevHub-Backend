const axios = require("axios");

const repoModel = require("../models/repoModel");

const fetchAndSaveGithubData = async (user) => {
  try {

    // =========================
    // FETCH GITHUB PROFILE
    // =========================

    const profileResponse = await axios.get(
      `https://api.github.com/users/${user.githubUsername}`
    );

    const profileData = profileResponse.data;


    // =========================
    // FETCH REPOSITORIES
    // =========================

    const repoResponse = await axios.get(
      `https://api.github.com/users/${user.githubUsername}/repos`
    );

    const repos = repoResponse.data;


    // =========================
    // TOP 5 REPOS BY STARS
    // =========================

    const topRepos = repos
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count
      )
      .slice(0, 5);


    // =========================
    // DELETE OLD REPOS
    // =========================

    await repoModel.deleteMany({
      user: user._id
    });


    // =========================
    // CALCULATIONS
    // =========================

    let totalStars = 0;

    const languagesSet = new Set();


    // =========================
    // SAVE REPOS
    // =========================

    for (const repo of topRepos) {

      totalStars += repo.stargazers_count;

      if (repo.language) {
        languagesSet.add(repo.language);
      }

      await repoModel.create({

        user: user._id,

        repoName: repo.name,

        description:
          repo.description || "No description",

        stars: repo.stargazers_count,

        forks: repo.forks_count,

        language:
          repo.language || "Unknown",

        repoUrl: repo.html_url,

        githubRepoId: repo.id

      });

    }


    // =========================
    // UPDATE USER PROFILE
    // =========================

    user.avatar = profileData.avatar_url;

    user.bio =
      profileData.bio || "";

    user.followers =
      profileData.followers || 0;

    user.following =
      profileData.following || 0;

    user.publicRepos =
      profileData.public_repos || 0;

    user.totalStars = totalStars;

    user.languages = [...languagesSet];


    // OPTIONAL:
    // auto skills from languages

    if (
      !user.skills ||
      user.skills.length === 0
    ) {
      user.skills = [...languagesSet];
    }


    // =========================
    // SAVE USER
    // =========================

    await user.save();


    console.log(
      "GitHub data fetched successfully"
    );

  } catch (error) {

    console.log(
      "GitHub Fetch Error:",
      error.message
    );

  }
};

module.exports = fetchAndSaveGithubData;